/**
 * Minimal OPC-UA simulator using node-opcua.
 * Exposes:
 * - A variable 'Telemetry/Temperature' (double) that increments periodically.
 * - A Method 'Commands/Execute' that logs incoming commands (simulates actuation).
 *
 * NOTE: Intended for CI smoke-tests only.
 */

import {
  OPCUAServer,
  Variant,
  DataType,
  VariantArrayType,
  StatusCodes,
  UAObject,
  MethodHandlerAsyncCallback
} from "node-opcua";

async function startServer() {
  const server = new OPCUAServer({
    port: 4334,
    resourcePath: "/UA/NewGenSim",
    buildInfo: {
      productName: "NewGen-OPCUA-Simulator",
      buildNumber: "0.1.0",
      buildDate: new Date()
    }
  });

  await server.initialize();

  const addressSpace = server.engine.addressSpace!;
  const namespace = addressSpace.registerNamespace("urn:newgen:sim");

  const device = namespace.addObject({
    organizedBy: addressSpace.rootFolder.objects,
    browseName: "SimDevice"
  }) as UAObject;

  // Telemetry variable
  let temp = 20.0;
  namespace.addVariable({
    componentOf: device,
    browseName: "Temperature",
    nodeId: "ns=1;s=Telemetry/Temperature",
    dataType: "Double",
    value: {
      get: () => new Variant({ dataType: DataType.Double, value: temp })
    }
  });

  // Command method
  const method = namespace.addMethod(device, {
    browseName: "ExecuteCommand",
    nodeId: "ns=1;s=Commands/Execute",
    inputArguments: [
      {
        name: "command",
        description: { text: "JSON-encoded command" },
        dataType: DataType.String
      }
    ],
    outputArguments: [
      {
        name: "status",
        description: { text: "status string" },
        dataType: DataType.String
      }
    ]
  });

  method.bindMethod(async (inputArguments, context, callback: MethodHandlerAsyncCallback) => {
    const cmd = inputArguments[0].value as string;
    console.log(`[Simulator] Received command: ${cmd}`);
    const status = "ack";
    callback(null, {
      statusCode: StatusCodes.Good,
      outputArguments: [{ dataType: DataType.String, value: status }]
    });
  });

  await server.start();
  console.log("OPC-UA simulator started at opc.tcp://localhost:4334/UA/NewGenSim");

  // Update telemetry periodically
  setInterval(() => {
    temp += Math.random() * 0.5 - 0.25;
  }, 1000);

  process.on("SIGINT", async () => {
    await server.shutdown(1000);
    process.exit(0);
  });
}

startServer().catch((err) => {
  console.error("Failed to start simulator", err);
  process.exit(1);
});
