import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { MetaApiClient } from "../services/api.js";
import { errorResult, truncate, truncateField, buildPaginationNote, ResponseFormatSchema } from "../services/utils.js";
import { MetaPaginatedResponse } from "../types.js";

interface ProductCatalog {
  id: string;
  name?: string;
  product_count?: number;
  vertical?: string;
  business?: { id: string; name: string };
  store_catalog_settings?: Record<string, unknown>;
}

interface Product {
  id: string;
  name?: string;
  description?: string;
  price?: string;
  currency?: string;
  availability?: string;
  image_url?: string;
  url?: string;
  brand?: string;
  category?: string;
  retailer_id?: string;
  sale_price?: string;
  condition?: string;
  inventory?: number;
}

interface ProductSet {
  id: string;
  name?: string;
  filter?: Record<string, unknown>;
  product_count?: number;
}

const CATALOG_FIELDS = "id,name,product_count,vertical,business";
const CATALOG_DETAIL_FIELDS = "id,name,product_count,vertical,business,store_catalog_settings";
const PRODUCT_LIST_FIELDS = "id,name,description,price,currency,availability,image_url,url,brand,category,retailer_id";
const PRODUCT_DETAIL_FIELDS = "id,name,description,price,currency,availability,image_url,url,brand,category,retailer_id,sale_price,condition,inventory";
const PRODUCT_SET_FIELDS = "id,name,filter,product_count";

export function registerCommerceTools(server: McpServer, client: MetaApiClient): void {
  // ─── List Product Catalogs ────────────────────────────────────────────────
  server.registerTool(
    "meta_list_product_catalogs",
    {
      title: "List Product Catalogs",
      description: `Lists product catalogs for a Meta business.

Args:
  - business_id (string): The business ID
  - limit (number): Max results (1–100, default 25)

Returns catalog IDs, names, product counts, and verticals.`,
      inputSchema: z
        .object({
          business_id: z.string().describe("Business ID"),
          limit: z.number().min(1).max(100).default(25).describe("Max results (default 25)"),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ business_id, limit, response_format }) => {
      try {
        const data = await client.get<MetaPaginatedResponse<ProductCatalog>>(
          `/${business_id}/owned_product_catalogs`,
          { fields: CATALOG_FIELDS, limit: String(limit) }
        );

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No product catalogs found." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const lines = [`# Product Catalogs (${data.data.length})`, ""];
        for (const cat of data.data) {
          lines.push(`## ${cat.name ?? "Unnamed"} (\`${cat.id}\`)`);
          if (cat.product_count != null) lines.push(`- **Products**: ${cat.product_count}`);
          if (cat.vertical) lines.push(`- **Vertical**: ${cat.vertical}`);
          if (cat.business) lines.push(`- **Business**: ${cat.business.name} (\`${cat.business.id}\`)`);
          lines.push("");
        }

        lines.push(buildPaginationNote(data.data.length, data.paging?.cursors?.after));
        return { content: [{ type: "text", text: truncate(lines.join("\n"), "product catalogs") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Product Catalog ──────────────────────────────────────────────────
  server.registerTool(
    "meta_get_product_catalog",
    {
      title: "Get Product Catalog",
      description: `Gets details for a single product catalog.

Args:
  - catalog_id (string): The catalog ID

Returns catalog name, product count, vertical, business info, and store settings.`,
      inputSchema: z
        .object({
          catalog_id: z.string().describe("Product catalog ID"),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ catalog_id, response_format }) => {
      try {
        const data = await client.get<ProductCatalog>(`/${catalog_id}`, {
          fields: CATALOG_DETAIL_FIELDS,
        });

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const lines = [`# Product Catalog: ${data.name ?? "Unnamed"}`, ""];
        lines.push(`- **ID**: \`${data.id}\``);
        if (data.product_count != null) lines.push(`- **Products**: ${data.product_count}`);
        if (data.vertical) lines.push(`- **Vertical**: ${data.vertical}`);
        if (data.business) lines.push(`- **Business**: ${data.business.name} (\`${data.business.id}\`)`);
        if (data.store_catalog_settings) {
          lines.push(`- **Store Settings**: ${JSON.stringify(data.store_catalog_settings)}`);
        }

        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── List Products ────────────────────────────────────────────────────────
  server.registerTool(
    "meta_list_products",
    {
      title: "List Products",
      description: `Lists products in a product catalog.

Args:
  - catalog_id (string): The catalog ID
  - limit (number): Max results (1–100, default 25)
  - after (string, optional): Pagination cursor
  - filter (object, optional): Filter criteria (e.g., { availability: "in stock" })

Returns product IDs, names, prices, availability, and more.`,
      inputSchema: z
        .object({
          catalog_id: z.string().describe("Product catalog ID"),
          limit: z.number().min(1).max(100).default(25).describe("Max results (default 25)"),
          after: z.string().optional().describe("Pagination cursor from previous response"),
          filter: z
            .record(z.string())
            .optional()
            .describe('Filter criteria (e.g., { availability: "in stock" })'),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ catalog_id, limit, after, filter, response_format }) => {
      try {
        const params: Record<string, string> = {
          fields: PRODUCT_LIST_FIELDS,
          limit: String(limit),
        };
        if (after) params.after = after;
        if (filter) params.filter = JSON.stringify(filter);

        const data = await client.get<MetaPaginatedResponse<Product>>(
          `/${catalog_id}/products`,
          params
        );

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No products found." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const lines = [`# Products (${data.data.length})`, ""];
        for (const p of data.data) {
          lines.push(`## ${truncateField(p.name ?? "Unnamed", 80)} (\`${p.id}\`)`);
          if (p.price) lines.push(`- **Price**: ${p.price} ${p.currency ?? ""}`);
          if (p.availability) lines.push(`- **Availability**: ${p.availability}`);
          if (p.brand) lines.push(`- **Brand**: ${p.brand}`);
          if (p.category) lines.push(`- **Category**: ${p.category}`);
          if (p.retailer_id) lines.push(`- **Retailer ID**: ${p.retailer_id}`);
          if (p.description) lines.push(`- **Description**: ${truncateField(p.description, 120)}`);
          if (p.url) lines.push(`- **URL**: ${p.url}`);
          lines.push("");
        }

        lines.push(buildPaginationNote(data.data.length, data.paging?.cursors?.after));
        return { content: [{ type: "text", text: truncate(lines.join("\n"), "products") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Get Product ──────────────────────────────────────────────────────────
  server.registerTool(
    "meta_get_product",
    {
      title: "Get Product",
      description: `Gets details for a single product.

Args:
  - product_id (string): The product ID

Returns full product details including price, availability, sale price, condition, and inventory.`,
      inputSchema: z
        .object({
          product_id: z.string().describe("Product ID"),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ product_id, response_format }) => {
      try {
        const data = await client.get<Product>(`/${product_id}`, {
          fields: PRODUCT_DETAIL_FIELDS,
        });

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const lines = [`# Product: ${data.name ?? "Unnamed"}`, ""];
        lines.push(`- **ID**: \`${data.id}\``);
        if (data.price) lines.push(`- **Price**: ${data.price} ${data.currency ?? ""}`);
        if (data.sale_price) lines.push(`- **Sale Price**: ${data.sale_price}`);
        if (data.availability) lines.push(`- **Availability**: ${data.availability}`);
        if (data.condition) lines.push(`- **Condition**: ${data.condition}`);
        if (data.inventory != null) lines.push(`- **Inventory**: ${data.inventory}`);
        if (data.brand) lines.push(`- **Brand**: ${data.brand}`);
        if (data.category) lines.push(`- **Category**: ${data.category}`);
        if (data.retailer_id) lines.push(`- **Retailer ID**: ${data.retailer_id}`);
        if (data.description) lines.push(`- **Description**: ${truncateField(data.description, 200)}`);
        if (data.url) lines.push(`- **URL**: ${data.url}`);
        if (data.image_url) lines.push(`- **Image**: ${data.image_url}`);

        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Create Product ───────────────────────────────────────────────────────
  server.registerTool(
    "meta_create_product",
    {
      title: "Create Product",
      description: `Adds a product to a catalog.

Args:
  - catalog_id (string): The catalog ID
  - name (string): Product name
  - description (string): Product description
  - price (number): Price in cents
  - currency (string): Currency code (default "USD")
  - availability (enum): "in stock", "out of stock", "preorder", "available for order"
  - image_url (string): Product image URL
  - url (string): Product page URL
  - brand (string, optional): Brand name
  - category (string, optional): Product category
  - retailer_id (string): Your unique product ID

Returns the created product ID.`,
      inputSchema: z
        .object({
          catalog_id: z.string().describe("Product catalog ID"),
          name: z.string().describe("Product name"),
          description: z.string().describe("Product description"),
          price: z.number().describe("Price in cents"),
          currency: z.string().default("USD").describe("Currency code (default USD)"),
          availability: z
            .enum(["in stock", "out of stock", "preorder", "available for order"])
            .describe("Product availability"),
          image_url: z.string().describe("Product image URL"),
          url: z.string().describe("Product page URL"),
          brand: z.string().optional().describe("Brand name"),
          category: z.string().optional().describe("Product category"),
          retailer_id: z.string().describe("Your unique product ID"),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async ({ catalog_id, name, description, price, currency, availability, image_url, url, brand, category, retailer_id, response_format }) => {
      try {
        const fields: Record<string, unknown> = {
          name,
          description,
          price,
          currency,
          availability,
          image_url,
          url,
          retailer_id,
        };
        if (brand) fields.brand = brand;
        if (category) fields.category = category;

        const result = await client.post<{ id: string }>(
          `/${catalog_id}/products`,
          fields
        );

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }

        return {
          content: [
            {
              type: "text",
              text: `Product created successfully.\n\n- **Product ID**: \`${result.id}\`\n- **Name**: ${name}\n- **Price**: ${price} ${currency}\n- **Availability**: ${availability}`,
            },
          ],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Update Product ───────────────────────────────────────────────────────
  server.registerTool(
    "meta_update_product",
    {
      title: "Update Product",
      description: `Updates a product's details.

Args:
  - product_id (string): The product ID
  - name, description, price, availability, image_url, url (all optional)

Returns confirmation of the update.`,
      inputSchema: z
        .object({
          product_id: z.string().describe("Product ID"),
          name: z.string().optional().describe("Product name"),
          description: z.string().optional().describe("Product description"),
          price: z.number().optional().describe("Price in cents"),
          availability: z.string().optional().describe("Product availability"),
          image_url: z.string().optional().describe("Product image URL"),
          url: z.string().optional().describe("Product page URL"),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ product_id, name, description, price, availability, image_url, url, response_format }) => {
      try {
        const fields: Record<string, unknown> = {};
        if (name !== undefined) fields.name = name;
        if (description !== undefined) fields.description = description;
        if (price !== undefined) fields.price = price;
        if (availability !== undefined) fields.availability = availability;
        if (image_url !== undefined) fields.image_url = image_url;
        if (url !== undefined) fields.url = url;

        await client.post(`/${product_id}`, fields);

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify({ success: true, product_id }, null, 2) }] };
        }

        return {
          content: [
            {
              type: "text",
              text: `Product \`${product_id}\` updated successfully.`,
            },
          ],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Delete Product ───────────────────────────────────────────────────────
  server.registerTool(
    "meta_delete_product",
    {
      title: "Delete Product",
      description: `Deletes a product from a catalog.

Args:
  - product_id (string): The product ID

This action is permanent and cannot be undone.`,
      inputSchema: z
        .object({
          product_id: z.string().describe("Product ID"),
        })
        .strict(),
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async ({ product_id }) => {
      try {
        const result = await client.delete<{ success: boolean }>(`/${product_id}`);

        return {
          content: [
            {
              type: "text",
              text: result.success
                ? `Product \`${product_id}\` deleted successfully.`
                : `Failed to delete product \`${product_id}\`.`,
            },
          ],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── List Product Sets ────────────────────────────────────────────────────
  server.registerTool(
    "meta_list_product_sets",
    {
      title: "List Product Sets",
      description: `Lists product sets (subgroups) in a catalog.

Args:
  - catalog_id (string): The catalog ID
  - limit (number): Max results (1–100, default 25)

Returns product set IDs, names, filters, and product counts.`,
      inputSchema: z
        .object({
          catalog_id: z.string().describe("Product catalog ID"),
          limit: z.number().min(1).max(100).default(25).describe("Max results (default 25)"),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ catalog_id, limit, response_format }) => {
      try {
        const data = await client.get<MetaPaginatedResponse<ProductSet>>(
          `/${catalog_id}/product_sets`,
          { fields: PRODUCT_SET_FIELDS, limit: String(limit) }
        );

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No product sets found." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const lines = [`# Product Sets (${data.data.length})`, ""];
        for (const ps of data.data) {
          lines.push(`## ${ps.name ?? "Unnamed"} (\`${ps.id}\`)`);
          if (ps.product_count != null) lines.push(`- **Products**: ${ps.product_count}`);
          if (ps.filter) lines.push(`- **Filter**: ${JSON.stringify(ps.filter)}`);
          lines.push("");
        }

        lines.push(buildPaginationNote(data.data.length, data.paging?.cursors?.after));
        return { content: [{ type: "text", text: truncate(lines.join("\n"), "product sets") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── List Product Feeds ──────────────────────────────────────────────────
  server.registerTool(
    "meta_list_product_feeds",
    {
      title: "List Product Feeds",
      description: `Lists product feeds for a catalog. Feeds are automated data sources that keep catalogs up-to-date.

Args:
  - catalog_id (string): Product catalog ID
  - limit (number): Max results (1–100, default 25)

Returns feed IDs, names, schedules, and latest upload status.`,
      inputSchema: z
        .object({
          catalog_id: z.string().describe("Product catalog ID"),
          limit: z.number().min(1).max(100).default(25),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ catalog_id, limit, response_format }) => {
      try {
        const data = await client.get<MetaPaginatedResponse<{
          id: string;
          name?: string;
          created_time?: string;
          latest_upload?: { end_time?: string; status?: string; num_uploaded?: number; num_detected_items?: number };
          schedule?: { interval?: string; url?: string };
        }>>(`/${catalog_id}/product_feeds`, {
          fields: "id,name,created_time,latest_upload,schedule",
          limit: String(limit),
        });

        if (!data.data?.length) {
          return { content: [{ type: "text", text: "No product feeds found." }] };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }

        const lines = [`# Product Feeds (${data.data.length})`, ""];
        for (const feed of data.data) {
          lines.push(`## ${feed.name ?? "Unnamed"} (\`${feed.id}\`)`);
          if (feed.schedule?.interval) lines.push(`- **Schedule**: ${feed.schedule.interval}`);
          if (feed.schedule?.url) lines.push(`- **URL**: ${truncateField(feed.schedule.url, 100)}`);
          if (feed.latest_upload) {
            const u = feed.latest_upload;
            lines.push(`- **Last Upload**: ${u.status ?? "unknown"}${u.end_time ? ` (${u.end_time})` : ""}${u.num_uploaded ? ` — ${u.num_uploaded} items` : ""}`);
          }
          lines.push("");
        }
        return { content: [{ type: "text", text: truncate(lines.join("\n"), "product feeds") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Create Product Feed ─────────────────────────────────────────────────
  server.registerTool(
    "meta_create_product_feed",
    {
      title: "Create Product Feed",
      description: `Creates a new product feed for a catalog to automatically sync products from a URL.

Args:
  - catalog_id (string): Product catalog ID
  - name (string): Feed name
  - schedule_url (string): URL of the product feed file (CSV, TSV, XML)
  - schedule_interval (string): How often to fetch — HOURLY, DAILY, WEEKLY, MONTHLY

Returns the new feed ID.`,
      inputSchema: z
        .object({
          catalog_id: z.string().describe("Product catalog ID"),
          name: z.string().min(1).describe("Feed name"),
          schedule_url: z.string().url().describe("Product feed URL (CSV/TSV/XML)"),
          schedule_interval: z.enum(["HOURLY", "DAILY", "WEEKLY", "MONTHLY"]).describe("Fetch interval"),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async ({ catalog_id, name, schedule_url, schedule_interval, response_format }) => {
      try {
        const result = await client.post<{ id: string }>(
          `/${catalog_id}/product_feeds`,
          {
            name,
            schedule: { interval: schedule_interval, url: schedule_url },
          }
        );

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }

        return {
          content: [{
            type: "text",
            text: `Product feed created.\n\n- **Feed ID**: \`${result.id}\`\n- **Name**: ${name}\n- **Interval**: ${schedule_interval}`,
          }],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );
}
