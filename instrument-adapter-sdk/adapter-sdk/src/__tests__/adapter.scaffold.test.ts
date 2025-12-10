import { InstrumentAdapter } from "../adapter";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("InstrumentAdapter (scaffold smoke tests)", () => {
  const platformEndpoint = "http://localhost:4000";
  let adapter: InstrumentAdapter;

  beforeEach(() => {
    adapter = new InstrumentAdapter(platformEndpoint);
    mockedAxios.post.mockReset();
  });

  test("registerDevice returns deviceId and calls platform register", async () => {
    mockedAxios.post.mockResolvedValue({ status: 200 });
    const id = await adapter.registerDevice({ vendor: "Acme", model: "X1", protocol: "opcua" });
    expect(id).toBeDefined();
    const status = await adapter.getDeviceStatus(id);
    expect(status).not.toBeNull();
  });

  test("pushTelemetry returns true when platform reachable", async () => {
    const id = await adapter.registerDevice({ vendor: "Acme", model: "X1", protocol: "opcua" });
    mockedAxios.post.mockResolvedValue({ status: 200 });
    const ok = await adapter.pushTelemetry(id, "telemetry", { data: { temp: 25 } });
    expect(ok).toBe(true);
  });

  test("sendCommand requires operator signature", async () => {
    const id = await adapter.registerDevice({ vendor: "Acme", model: "X1", protocol: "opcua" });
    await expect(adapter.sendCommand(id, "start", {}, undefined as any)).rejects.toThrow("Operator signature required");
  });

  test("sendCommand enqueues and attempts to notify platform", async () => {
    const id = await adapter.registerDevice({ vendor: "Acme", model: "X1", protocol: "opcua" });
    mockedAxios.post.mockRejectedValue(new Error("unreachable"));
    const res = await adapter.sendCommand(id, "start", { speed: 10 }, { operatorId: "op-1", signature: "sig" });
    expect(res.commandId).toMatch(/^cmd-/);
    expect(res.status).toBe("queued");
  });
});
