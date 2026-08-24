import { definePlugin } from "nitro";
import { initializeDbPool } from "../utils/db";

export default definePlugin(async app => {
    await initializeDbPool();
})