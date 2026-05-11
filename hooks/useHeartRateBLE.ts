import { useEffect, useRef, useState } from "react";
import { BleManager, Device } from "react-native-ble-plx";
import { Buffer } from "buffer";
import { getSavedDeviceId, saveDeviceId } from "@/services/LocalUserService";

const HR_SERVICE = "180D";
const HR_CHARACTERISTIC = "2A37";
const HR_BUFFER_WINDOW = 60_000;

type HRPoint = {
  value: number;
  timestamp: number;
};

export function useHeartRateBLE() {
  const manager = useRef(new BleManager()).current;
  const deviceRef = useRef<Device | null>(null);
  const hrBuffer = useRef<HRPoint[]>([]);
  const isConnecting = useRef(false);
  const discoveredDevices = useRef<Map<string, Device>>(new Map());
  const scannedDevices = useRef(0);

  const [isConnected, setIsConnected] = useState(false);

  const decodeHeartRate = (base64Value: string): number => {
    const data = Buffer.from(base64Value, "base64");
    const flags = data[0];

    const is16Bit = flags & 0x01;
    return is16Bit ? data.readUInt16LE(1) : data[1];
  };

  const addToBuffer = (hr: number) => {
    const now = Date.now();
    hrBuffer.current.push({ value: hr, timestamp: now });

    // keep last 60 sec
    hrBuffer.current = hrBuffer.current.filter(
      (p) => now - p.timestamp <= HR_BUFFER_WINDOW,
    );
  };
  const getAverageHR = (seconds: number): number | null => {
    const now = Date.now();

    const recent = hrBuffer.current.filter(
      (p) => now - p.timestamp <= seconds * 1000,
    );
    if (recent.length === 0) return null;

    const avg = recent.reduce((sum, p) => sum + p.value, 0) / recent.length;
    return Math.round(avg);
  };

  const startListening = (device: Device) => {
    device.monitorCharacteristicForService(
      HR_SERVICE,
      HR_CHARACTERISTIC,
      (error, characteristic) => {
        if (error) {
          console.warn("BLE monitor error:", error);
          return;
        }
        if (!characteristic?.value) {
          console.warn("Couldn't find characteristic value while listening!");
          return;
        }

        try {
          const hr = decodeHeartRate(characteristic.value);

          if (hr > 0) {
            addToBuffer(hr);
          }
        } catch (e) {
          console.warn("Decode HR error:", e);
        }
      },
    );
  };

  const connectToDevice = async (device: Device) => {
    try {
      const connected = await device.connect();
      await connected.discoverAllServicesAndCharacteristics();

      deviceRef.current = connected;
      setIsConnected(true);

      // Listen for disconnect
      connected.onDisconnected(() => {
        console.warn("Device disconnected");
        setIsConnected(false);
        deviceRef.current = null;

        // optional auto-reconnect
        reconnect();
      });

      startListening(connected);

      await saveDeviceId(device.id);
    } catch (err) {
      console.error("Connect to device failed: ", err);
    }
  };

  const connectToSavedDevice = async (): Promise<boolean> => {
    try {
      const savedId = await getSavedDeviceId();
      console.log("Saved BLE device ID:", savedId);
      if (!savedId) return false;

      const device = await manager.connectToDevice(savedId, {
        timeout: 5000,
      });

      await connectToDevice(device);

      console.log("Reconnected to saved device successfully!");
      return true;
    } catch (e) {
      console.warn("Connect to saved device failed:", e);
      return false;
    }
  };

  const scanAndConnect = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.error("BLE Scan timeout!!");
        manager.stopDeviceScan();
        reject(new Error("Scan timeout"));
      }, 20000);

      manager.startDeviceScan(null, null, async (error, device) => {
        if (!device) {
          console.log("Invalid device!");
          return;
        }
        discoveredDevices.current.set(device.id, device);

        if (isConnecting.current) {
          console.log("Already in connecting state!");
          return;
        }
        isConnecting.current = true;
        scannedDevices.current = scannedDevices.current + 1;

        if (error) {
          clearTimeout(timeout);
          console.error("BLE device scan error: ", error);
          reject(error || "BLE device scan error!");
          return;
        }

        try {
          const connected = await device.connect();
          await connected.discoverAllServicesAndCharacteristics();

          const services = await connected.services();
          console.log("----> connected services:", services?.length);

          const hasHR = services.some((s) => {
            console.log("service IDS: ", {
              uuid: s.uuid,
              id: s.id,
              deviceId: s.deviceID,
            });
            return s.uuid.toLowerCase().includes(HR_SERVICE);
          });

          if (hasHR) {
            console.log("✅ HR device found");
            manager.stopDeviceScan();

            deviceRef.current = connected;
            startListening(connected);
            await saveDeviceId(device.id);

            setIsConnected(true);
            clearTimeout(timeout);
            resolve();
          } else {
            await connected.cancelConnection();
          }
          isConnecting.current = false;
        } catch (e) {
          console.error("Scan and Connect failed for a device:", e);
          isConnecting.current = false;
          clearTimeout(timeout);
          reject(e);
        }

        // console.log("----> Device service UUIDs:", device?.serviceUUIDs);
        // console.log("----> Device name:", device?.name);
        // console.log("----> Device localName:", device?.localName);

        // // Look for devices advertising HR service
        // if (
        //   device?.serviceUUIDs?.includes(HR_SERVICE) ||
        //   device?.name?.toLowerCase().includes("garmin") ||
        //   device?.localName?.toLowerCase().includes("garmin")
        // ) {
        //   try {
        //     manager.stopDeviceScan();
        //     await connectToDevice(device);

        //     clearTimeout(timeout);
        //     resolve();
        //   } catch (e) {
        //     console.error("Scan and Connect failed:", e);
        //     clearTimeout(timeout);
        //     reject(e);
        //   }
        // } else {
        //   console.warn("No service UUIDs found for HR!");
        //   reject("No service UUIDs found for HR!");
        // }
      });
    });
  };

  const reconnect = async () => {
    if (isConnecting.current) return;
    // isConnecting.current = true;

    try {
      const ok = await connectToSavedDevice();
      if (!ok) {
        await scanAndConnect();
      }
    } catch (e: any) {
      console.warn("Reconnect failed:", e);
    } finally {
      // isConnecting.current = false;
    }
  };

  const scanAllDiscoveredDevices = async () => {
    for (const device of discoveredDevices.current.values()) {
      if (isConnecting.current) {
        console.log("Already in connecting state!");
        return;
      }
      isConnecting.current = true;

      try {
        const connected = await device.connect();
        await connected.discoverAllServicesAndCharacteristics();

        const services = await connected.services();
        console.log("----> connected services:", services?.length);

        const hasHR = services.some((s) => {
          console.log("service IDS: ", {
            uuid: s.uuid,
            id: s.id,
            deviceId: s.deviceID,
          });
          return s.uuid.toLowerCase().includes(HR_SERVICE);
        });

        if (hasHR) {
          console.log("✅ HR device found");
          manager.stopDeviceScan();

          deviceRef.current = connected;
          startListening(connected);
          await saveDeviceId(device.id);

          setIsConnected(true);
        } else {
          await connected.cancelConnection();
        }
        isConnecting.current = false;
      } catch (e) {
        console.error("Scan and Connect failed for a discovered device:", e);
        isConnecting.current = false;
      }
    }

    throw new Error("No HR device found");
  };

  const startMonitoring = async () => {
    try {
      if (isConnected || isConnecting.current) return;
      // isConnecting.current = true;

      const reconnected = await connectToSavedDevice();
      if (!reconnected) {
        console.log("Falling back to scan...");
        await scanAndConnect();
      }

      console.log("Discovered Devices length:", discoveredDevices.current.size);
      console.log("Scanned Devices length:", scannedDevices.current);
      if (
        !isConnected ||
        scannedDevices.current < discoveredDevices.current.size
      ) {
        await scanAllDiscoveredDevices();
      }
    } catch (e) {
      console.error("Start monitoring failed:", e);
    } finally {
      // isConnecting.current = false;
    }
  };

  const stopMonitoring = async () => {
    try {
      if (deviceRef.current) {
        await deviceRef.current.cancelConnection();
      }

      deviceRef.current = null;
      setIsConnected(false);
      hrBuffer.current = [];
    } catch (e) {
      console.warn("Stop monitoring error:", e);
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      manager.destroy();
    };
  }, []);

  return {
    startMonitoring,
    stopMonitoring,
    getAverageHR,
  };
}
