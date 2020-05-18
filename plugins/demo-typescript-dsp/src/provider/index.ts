import { manifest } from "./manifest";
import { test } from "./test-response";
import { handler } from "./handler";

const provider = {
  name: "demo-ts-dsp",
  manifest,
  test,
  handler,
};

export default provider;
