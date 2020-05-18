// test url is http://foo.com/testFeed.json

const feed = {
  id: "A1234",
  type: { value: "feed" },
  entry: [{ id: "ENTRY_001", type: { value: "video" }, content: { src: "" } }],
};

export const test = {
  testCommand:
    "demo-ts-dsp://fetchData?type=feed&url=aHR0cHM6Ly9mb28uY29tL3Rlc3RGZWVkLmpzb24%3D",
  requestMocks: [
    {
      host: "https://foo.com",
      method: "get",
      path: "/testFeed.json",
      expectedResponse: feed,
    },
  ],
};
