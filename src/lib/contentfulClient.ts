import * as contentful from "contentful";
import dotenv from "dotenv";

dotenv.config();



const space = process.env.CONTENTFUL_SPACE_ID;
const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;

if (!space || !accessToken) {
  throw new Error("Missing CONTENTFUL_SPACE_ID or CONTENTFUL_ACCESS_TOKEN");
}

const client = contentful.createClient({
  space: space as string,
  accessToken: accessToken as string,
});

export default client;