import { defineConfig } from "cypress";
import * as fs from "fs";
import * as dotenv from "dotenv";


dotenv.config({ path: "./.env.development" });

export default defineConfig({
  env: { ...process.env },  
  e2e: {
    setupNodeEvents(on, config) {
      on("task", {
        exists(filePath) {
          return fs.existsSync(filePath);
        },
      });

      
      config.env = { ...process.env };
      return config;
    },
  },
});
