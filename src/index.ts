#!/usr/bin/env node
/**
 * MCP Server generated from OpenAPI spec for blindpay-mcp v1.0.0
 * Generated on: 2026-02-11T15:11:41.893Z
 */

// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Tool,
  type CallToolResult,
  type CallToolRequest,
} from '@modelcontextprotocol/sdk/types.js';

import { z, ZodError } from 'zod';
import axios, { type AxiosRequestConfig, type AxiosError } from 'axios';

/**
 * Type definition for JSON objects
 */
type JsonObject = Record<string, any>;

/**
 * Interface for MCP Tool Definition
 */
interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: any;
  method: string;
  pathTemplate: string;
  executionParameters: { name: string; in: string }[];
  requestBodyContentType?: string;
  securityRequirements: any[];
}

/**
 * Server configuration
 */
export const SERVER_NAME = '@blindpay/mcp';
export const SERVER_VERSION = '1.3.0';
export const API_BASE_URL = 'https://api.blindpay.com';

/**
 * MCP Server instance
 */
const mcpServer = new McpServer(
  { name: SERVER_NAME, version: SERVER_VERSION },
  { capabilities: { tools: {} } }
);

// Access the underlying Server for handler registration
const server = mcpServer.server;

/**
 * Map of tool definitions by name
 */
const toolDefinitionMap: Map<string, McpToolDefinition> = new Map([

  ["PostV1Users", {
    name: "PostV1Users",
    description: `Create User`,
    inputSchema: {"type":"object","properties":{}},
    method: "post",
    pathTemplate: "/v1/users",
    executionParameters: [],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1Whoami", {
    name: "GetV1Whoami",
    description: `Retrieve Who Am I`,
    inputSchema: {"type":"object","properties":{}},
    method: "get",
    pathTemplate: "/v1/whoami",
    executionParameters: [],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PutV1WhoamiAvatar", {
    name: "PutV1WhoamiAvatar",
    description: `Retrieve Avatar`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"image_url":{"type":"string","format":"uri"}},"required":["image_url"],"description":"Update avatar url"}}},
    method: "put",
    pathTemplate: "/v1/whoami/avatar",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PutV1WhoamiPersonal", {
    name: "PutV1WhoamiPersonal",
    description: `Update Personal Data`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"first_name":{"type":"string","minLength":1,"maxLength":100},"last_name":{"type":"string","minLength":1,"maxLength":100},"middle_name":{"type":["string","null"],"minLength":1,"maxLength":100},"has_passkey":{"type":["boolean","null"]}},"required":["first_name","last_name"],"description":"Update personal data"}}},
    method: "put",
    pathTemplate: "/v1/whoami/personal",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1Upload", {
    name: "PostV1Upload",
    description: `Upload File`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string"},"requestBody":{"type":"string","description":"Upload file to instance"}}},
    method: "post",
    pathTemplate: "/v1/upload",
    executionParameters: [{"name":"instance_id","in":"query"}],
    requestBodyContentType: "multipart/form-data",
    securityRequirements: []
  }],
  ["GetV1FilesByKey", {
    name: "GetV1FilesByKey",
    description: `Get File (Authenticated)`,
    inputSchema: {"type":"object","properties":{"bucket":{"type":"string","enum":["avatar","onboarding","limit_increase"]},"key":{"type":"string"},"expires_in":{"type":"string","default":"3600"}},"required":["bucket","key"]},
    method: "get",
    pathTemplate: "/v1/files/{bucket}/{key}",
    executionParameters: [{"name":"bucket","in":"path"},{"name":"key","in":"path"},{"name":"expires_in","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1FilesSetCookie", {
    name: "PostV1FilesSetCookie",
    description: `Set CloudFront Signed Cookies`,
    inputSchema: {"type":"object","properties":{"expires_in":{"type":"string","default":"3600"}}},
    method: "post",
    pathTemplate: "/v1/files/set-cookie",
    executionParameters: [{"name":"expires_in","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1InstancesQuotes", {
    name: "PostV1InstancesQuotes",
    description: `Create Quote`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"requestBody":{"type":"object","properties":{"bank_account_id":{"type":"string","minLength":15,"maxLength":15},"currency_type":{"type":"string","enum":["sender","receiver"],"description":""},"cover_fees":{"type":["boolean","null"],"description":"If true, the sender will cover the fees. If false, the receiver will cover the fees."},"request_amount":{"type":"number","minimum":500,"description":"1000 represents 10.00, 2050 represents 20.50"},"network":{"type":"string","enum":["base","sepolia","arbitrum_sepolia","base_sepolia","arbitrum","polygon","polygon_amoy","ethereum","stellar","stellar_testnet","tron","solana","solana_devnet"],"description":"Check blindpay available networks"},"token":{"type":"string","enum":["USDC","USDT","USDB"],"description":"Check blindpay available tokens"},"description":{"type":["string","null"],"maxLength":128},"partner_fee_id":{"type":["string","null"],"minLength":15,"maxLength":15}},"required":["bank_account_id","currency_type","request_amount","network","token"],"description":"Create a new quote"}},"required":["instance_id"]},
    method: "post",
    pathTemplate: "/v1/instances/{instance_id}/quotes",
    executionParameters: [{"name":"instance_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1InstancesQuotesFx", {
    name: "PostV1InstancesQuotesFx",
    description: `Get FX Rate`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"requestBody":{"type":"object","properties":{"from":{"type":"string","enum":["USDC","USDT","USDB"]},"to":{"type":"string","enum":["BRL","USD","MXN","COP","ARS","EUR"]},"request_amount":{"type":"number","minimum":500,"description":"1000 represents 10.00, 2050 represents 20.50"},"currency_type":{"type":"string","enum":["sender","receiver"],"description":""}},"required":["from","to","request_amount","currency_type"],"description":"Check FX rate"}},"required":["instance_id"]},
    method: "post",
    pathTemplate: "/v1/instances/{instance_id}/quotes/fx",
    executionParameters: [{"name":"instance_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1InstancesPayoutsById", {
    name: "GetV1InstancesPayoutsById",
    description: `Retrieve Payout`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"id":{"type":"string","minLength":15,"maxLength":15}},"required":["instance_id","id"]},
    method: "get",
    pathTemplate: "/v1/instances/{instance_id}/payouts/{id}",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1EPayoutsById", {
    name: "GetV1EPayoutsById",
    description: `Retrieve Payout Track`,
    inputSchema: {"type":"object","properties":{"id":{"type":"string","minLength":15,"maxLength":15}},"required":["id"]},
    method: "get",
    pathTemplate: "/v1/e/payouts/{id}",
    executionParameters: [{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1InstancesPayouts", {
    name: "GetV1InstancesPayouts",
    description: `Retrieve Payouts`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"limit":{"type":"string","enum":["10","50","100","200","500","1000"],"description":"Number of items to return"},"offset":{"type":"string","enum":["0","10","50","100","200","500","1000"],"description":"Number of items to skip"},"starting_after":{"type":"string","description":"A cursor for use in pagination. starting_after is an object ID that defines your place in the list."},"ending_before":{"type":"string","description":"A cursor for use in pagination. ending_before is an object ID that defines your place in the list."},"receiver_id":{"type":"string","minLength":15,"maxLength":15},"customer_id":{"type":"string","minLength":15,"maxLength":15},"status":{"type":"string","enum":["processing","failed","refunded","completed","on_hold"]},"receiver_name":{"type":"string"},"bank_account_id":{"type":"string"},"country":{"type":"string"},"payment_method":{"type":"string","enum":["wire","ach","pix","pix_safe","ted","spei_bitso","transfers_bitso","ach_cop_bitso","international_swift","rtp","sepa"]},"network":{"type":"string"},"token":{"type":"string"}},"required":["instance_id"]},
    method: "get",
    pathTemplate: "/v1/instances/{instance_id}/payouts",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"limit","in":"query"},{"name":"offset","in":"query"},{"name":"starting_after","in":"query"},{"name":"ending_before","in":"query"},{"name":"receiver_id","in":"query"},{"name":"customer_id","in":"query"},{"name":"status","in":"query"},{"name":"receiver_name","in":"query"},{"name":"bank_account_id","in":"query"},{"name":"country","in":"query"},{"name":"payment_method","in":"query"},{"name":"network","in":"query"},{"name":"token","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1InstancesPayoutsExport", {
    name: "PostV1InstancesPayoutsExport",
    description: `Queues an async job that emails the requesting user a CSV of all payouts in the given date range.`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"requestBody":{"type":"object","properties":{"start_date":{"type":"string","format":"date-time","description":"Start of the date range (inclusive), ISO 8601."},"end_date":{"type":"string","format":"date-time","description":"End of the date range (inclusive), ISO 8601."}},"required":["start_date","end_date"],"description":"Date range to export"}},"required":["instance_id"]},
    method: "post",
    pathTemplate: "/v1/instances/{instance_id}/payouts/export",
    executionParameters: [{"name":"instance_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1InstancesPayoutsStellarAuthorize", {
    name: "PostV1InstancesPayoutsStellarAuthorize",
    description: `Authorize Token Stellar`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"requestBody":{"type":"object","properties":{"quote_id":{"type":"string","minLength":15,"maxLength":15},"sender_wallet_address":{"type":"string","description":"Payout wallet address"}},"required":["quote_id","sender_wallet_address"],"description":"The JSON request body."}},"required":["instance_id"]},
    method: "post",
    pathTemplate: "/v1/instances/{instance_id}/payouts/stellar/authorize",
    executionParameters: [{"name":"instance_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1InstancesPayoutsStellar", {
    name: "PostV1InstancesPayoutsStellar",
    description: `Create Payout on Stellar`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"requestBody":{"type":"object","properties":{"quote_id":{"type":"string","minLength":15,"maxLength":15},"signed_transaction":{"type":["string","null"],"description":"Signed transaction"},"sender_wallet_address":{"type":"string","description":"Payout wallet address"}},"required":["quote_id","sender_wallet_address"],"description":"Start payout on stellar blockchain"}},"required":["instance_id"]},
    method: "post",
    pathTemplate: "/v1/instances/{instance_id}/payouts/stellar",
    executionParameters: [{"name":"instance_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1InstancesPayoutsSolana", {
    name: "PostV1InstancesPayoutsSolana",
    description: `Create Payout on Solana`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"requestBody":{"type":"object","properties":{"quote_id":{"type":"string","minLength":15,"maxLength":15},"signed_transaction":{"type":["string","null"],"description":"Signed transaction"},"sender_wallet_address":{"type":"string","description":"Payout wallet address"}},"required":["quote_id","sender_wallet_address"],"description":"Start payout on solana blockchain"}},"required":["instance_id"]},
    method: "post",
    pathTemplate: "/v1/instances/{instance_id}/payouts/solana",
    executionParameters: [{"name":"instance_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1InstancesPayoutsEvm", {
    name: "PostV1InstancesPayoutsEvm",
    description: `Create Payout on EVM Chains`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"requestBody":{"type":"object","properties":{"quote_id":{"type":"string","minLength":15,"maxLength":15},"sender_wallet_address":{"type":"string","description":"Payout wallet address"}},"required":["quote_id","sender_wallet_address"],"description":"Start payout on evm blockchain"}},"required":["instance_id"]},
    method: "post",
    pathTemplate: "/v1/instances/{instance_id}/payouts/evm",
    executionParameters: [{"name":"instance_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1InstancesPayoutsDocuments", {
    name: "PostV1InstancesPayoutsDocuments",
    description: `Submit compliance documents for SWIFT payouts requiring review. Includes optional payment description.`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"id":{"type":"string","minLength":15,"maxLength":15},"requestBody":{"type":"object","properties":{"transaction_document_type":{"type":"string","enum":["invoice","purchase_order","delivery_slip","contract","customs_declaration","bill_of_lading","others"],"description":"Document type"},"transaction_document_id":{"type":"string","minLength":1,"maxLength":512,"description":"Document identifier (invoice number, contract ID, etc.)"},"transaction_document_file":{"type":"string","format":"uri","description":"URL to the uploaded document"},"description":{"type":"string","maxLength":128,"description":"Optional payment description/memo (max 128 chars)"}},"required":["transaction_document_type","transaction_document_id","transaction_document_file"],"description":"Document details and optional payment description"}},"required":["instance_id","id"]},
    method: "post",
    pathTemplate: "/v1/instances/{instance_id}/payouts/{id}/documents",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1InstancesReceivers", {
    name: "GetV1InstancesReceivers",
    description: `Retrieve Receivers`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"limit":{"type":"string","enum":["10","50","100","200","500","1000"],"description":"Number of items to return"},"offset":{"type":"string","enum":["0","10","50","100","200","500","1000"],"description":"Number of items to skip"},"starting_after":{"type":"string","description":"A cursor for use in pagination. starting_after is an object ID that defines your place in the list."},"ending_before":{"type":"string","description":"A cursor for use in pagination. ending_before is an object ID that defines your place in the list."},"full_name":{"type":"string"},"receiver_name":{"type":"string"},"customer_name":{"type":"string"},"status":{"type":"string","enum":["verifying","approved","rejected","deprecated","pending_review","awaiting_contract","compliance_request"]},"receiver_id":{"type":"string"},"customer_id":{"type":"string"},"bank_account_id":{"type":"string"},"country":{"type":"string"}},"required":["instance_id"]},
    method: "get",
    pathTemplate: "/v1/instances/{instance_id}/receivers",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"limit","in":"query"},{"name":"offset","in":"query"},{"name":"starting_after","in":"query"},{"name":"ending_before","in":"query"},{"name":"full_name","in":"query"},{"name":"receiver_name","in":"query"},{"name":"customer_name","in":"query"},{"name":"status","in":"query"},{"name":"receiver_id","in":"query"},{"name":"customer_id","in":"query"},{"name":"bank_account_id","in":"query"},{"name":"country","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1InstancesReceivers", {
    name: "PostV1InstancesReceivers",
    description: `Create Receiver`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"requestBody":{"type":"object","properties":{"type":{"type":"string","enum":["individual","business"]},"kyc_type":{"type":"string","enum":["light","standard","enhanced"]},"email":{"type":"string","format":"email"},"tax_id":{"type":["string","null"]},"address_line_1":{"type":["string","null"]},"address_line_2":{"type":["string","null"]},"city":{"type":["string","null"]},"state_province_region":{"type":["string","null"]},"country":{"type":"string","enum":["AF","AL","DZ","AS","AD","AO","AI","AQ","AG","AR","AM","AW","AU","AT","AZ","BS","BH","BD","BB","BY","BE","BZ","BJ","BM","BT","BO","BQ","BA","BW","BV","BR","IO","BN","BG","BF","BI","CV","KH","CM","CA","KY","CF","TD","CL","CN","CX","CC","CO","KM","CD","CG","CK","CR","HR","CU","CW","CY","CZ","CI","DK","DJ","DM","DO","EC","EG","SV","GQ","ER","EE","SZ","ET","FK","FO","FJ","FI","FR","GF","PF","TF","GA","GM","GE","DE","GH","GI","GR","GL","GD","GP","GU","GT","GG","GN","GW","GY","HT","HM","VA","HN","HK","HU","IS","IN","ID","IR","IQ","IE","IM","IL","IT","JM","JP","JE","JO","KZ","KE","KI","KP","KR","KW","KG","LA","LV","LB","LS","LR","LY","LI","LT","LU","MO","MG","MW","MY","MV","ML","MT","MH","MQ","MR","MU","YT","MX","FM","MD","MC","MN","ME","MS","MA","MZ","MM","NA","NR","NP","NL","NC","NZ","NI","NE","NG","NU","NF","MP","NO","OM","PK","PW","PS","PA","PG","PY","PE","PH","PN","PL","PT","PR","QA","MK","RO","RU","RW","RE","BL","SH","KN","LC","MF","PM","VC","WS","SM","ST","SA","SN","RS","SC","SL","SG","SX","SK","SI","SB","SO","ZA","GS","SS","ES","LK","SD","SR","SJ","SE","CH","SY","TW","TJ","TZ","TH","TL","TG","TK","TO","TT","TN","TR","TM","TC","TV","UG","UA","AE","GB","UM","US","UY","UZ","VU","VE","VN","VG","VI","WF","EH","YE","ZM","ZW","AX"]},"postal_code":{"type":["string","null"]},"ip_address":{"type":["string","null"],"format":"ip"},"image_url":{"type":["string","null"],"format":"uri"},"phone_number":{"type":["string","null"]},"proof_of_address_doc_type":{"type":["string","null"],"enum":["UTILITY_BILL","BANK_STATEMENT","RENTAL_AGREEMENT","TAX_DOCUMENT","GOVERNMENT_CORRESPONDENCE"]},"proof_of_address_doc_file":{"type":["string","null"],"format":"uri","description":"Please upload one document that serve as proof of address, this needs to be the same physical address as the one provided above. Only PDF and image files are accepted (.jpg, .jpeg, .png, .pdf) with a maximum size of 3MB."},"first_name":{"type":["string","null"]},"last_name":{"type":["string","null"]},"date_of_birth":{"anyOf":[{"type":"string","format":"date-time"},{"type":"string"},{"type":"null"}]},"id_doc_country":{"type":["string","null"],"enum":["AF","AL","DZ","AS","AD","AO","AI","AQ","AG","AR","AM","AW","AU","AT","AZ","BS","BH","BD","BB","BY","BE","BZ","BJ","BM","BT","BO","BQ","BA","BW","BV","BR","IO","BN","BG","BF","BI","CV","KH","CM","CA","KY","CF","TD","CL","CN","CX","CC","CO","KM","CD","CG","CK","CR","HR","CU","CW","CY","CZ","CI","DK","DJ","DM","DO","EC","EG","SV","GQ","ER","EE","SZ","ET","FK","FO","FJ","FI","FR","GF","PF","TF","GA","GM","GE","DE","GH","GI","GR","GL","GD","GP","GU","GT","GG","GN","GW","GY","HT","HM","VA","HN","HK","HU","IS","IN","ID","IR","IQ","IE","IM","IL","IT","JM","JP","JE","JO","KZ","KE","KI","KP","KR","KW","KG","LA","LV","LB","LS","LR","LY","LI","LT","LU","MO","MG","MW","MY","MV","ML","MT","MH","MQ","MR","MU","YT","MX","FM","MD","MC","MN","ME","MS","MA","MZ","MM","NA","NR","NP","NL","NC","NZ","NI","NE","NG","NU","NF","MP","NO","OM","PK","PW","PS","PA","PG","PY","PE","PH","PN","PL","PT","PR","QA","MK","RO","RU","RW","RE","BL","SH","KN","LC","MF","PM","VC","WS","SM","ST","SA","SN","RS","SC","SL","SG","SX","SK","SI","SB","SO","ZA","GS","SS","ES","LK","SD","SR","SJ","SE","CH","SY","TW","TJ","TZ","TH","TL","TG","TK","TO","TT","TN","TR","TM","TC","TV","UG","UA","AE","GB","UM","US","UY","UZ","VU","VE","VN","VG","VI","WF","EH","YE","ZM","ZW","AX"]},"id_doc_type":{"type":["string","null"],"enum":["PASSPORT","ID_CARD","DRIVERS"]},"id_doc_front_file":{"type":["string","null"],"format":"uri","description":"Only image files are accepted (.jpg, .jpeg, .png)"},"id_doc_back_file":{"type":["string","null"],"format":"uri","description":"Only image files are accepted (.jpg, .jpeg, .png)"},"legal_name":{"type":["string","null"]},"alternate_name":{"type":["string","null"]},"formation_date":{"anyOf":[{"type":"string","format":"date-time"},{"type":"string"},{"type":"null"}],"format":"date-time"},"website":{"type":["string","null"],"format":"uri"},"owners":{"type":["array","null"],"items":{"type":"object","properties":{"role":{"type":"string","enum":["beneficial_controlling","beneficial_owner","controlling_person"],"description":"A beneficial owner is someone who directly or indirectly owns 25% or more of your business. A controlling person is someone with significant responsibility to control, manage or direct your business (typically a CEO, senior executive officer or equivalent).","example":"beneficial_owner"},"first_name":{"type":"string","minLength":1,"example":"John"},"last_name":{"type":"string","minLength":1,"example":"Doe"},"date_of_birth":{"anyOf":[{"type":"string","format":"date-time"},{"type":"string"}],"example":"1998-01-01T00:00:00Z"},"tax_id":{"type":"string","example":"536804398"},"address_line_1":{"type":"string","example":"738 Plain St"},"address_line_2":{"type":["string","null"],"example":"Building 22"},"city":{"type":"string","example":"Marshfield"},"state_province_region":{"type":"string","example":"MA"},"country":{"type":"string","enum":["AF","AL","DZ","AS","AD","AO","AI","AQ","AG","AR","AM","AW","AU","AT","AZ","BS","BH","BD","BB","BY","BE","BZ","BJ","BM","BT","BO","BQ","BA","BW","BV","BR","IO","BN","BG","BF","BI","CV","KH","CM","CA","KY","CF","TD","CL","CN","CX","CC","CO","KM","CD","CG","CK","CR","HR","CU","CW","CY","CZ","CI","DK","DJ","DM","DO","EC","EG","SV","GQ","ER","EE","SZ","ET","FK","FO","FJ","FI","FR","GF","PF","TF","GA","GM","GE","DE","GH","GI","GR","GL","GD","GP","GU","GT","GG","GN","GW","GY","HT","HM","VA","HN","HK","HU","IS","IN","ID","IR","IQ","IE","IM","IL","IT","JM","JP","JE","JO","KZ","KE","KI","KP","KR","KW","KG","LA","LV","LB","LS","LR","LY","LI","LT","LU","MO","MG","MW","MY","MV","ML","MT","MH","MQ","MR","MU","YT","MX","FM","MD","MC","MN","ME","MS","MA","MZ","MM","NA","NR","NP","NL","NC","NZ","NI","NE","NG","NU","NF","MP","NO","OM","PK","PW","PS","PA","PG","PY","PE","PH","PN","PL","PT","PR","QA","MK","RO","RU","RW","RE","BL","SH","KN","LC","MF","PM","VC","WS","SM","ST","SA","SN","RS","SC","SL","SG","SX","SK","SI","SB","SO","ZA","GS","SS","ES","LK","SD","SR","SJ","SE","CH","SY","TW","TJ","TZ","TH","TL","TG","TK","TO","TT","TN","TR","TM","TC","TV","UG","UA","AE","GB","UM","US","UY","UZ","VU","VE","VN","VG","VI","WF","EH","YE","ZM","ZW","AX"],"example":"US"},"postal_code":{"type":"string","example":"02050"},"id_doc_country":{"type":"string","enum":["AF","AL","DZ","AS","AD","AO","AI","AQ","AG","AR","AM","AW","AU","AT","AZ","BS","BH","BD","BB","BY","BE","BZ","BJ","BM","BT","BO","BQ","BA","BW","BV","BR","IO","BN","BG","BF","BI","CV","KH","CM","CA","KY","CF","TD","CL","CN","CX","CC","CO","KM","CD","CG","CK","CR","HR","CU","CW","CY","CZ","CI","DK","DJ","DM","DO","EC","EG","SV","GQ","ER","EE","SZ","ET","FK","FO","FJ","FI","FR","GF","PF","TF","GA","GM","GE","DE","GH","GI","GR","GL","GD","GP","GU","GT","GG","GN","GW","GY","HT","HM","VA","HN","HK","HU","IS","IN","ID","IR","IQ","IE","IM","IL","IT","JM","JP","JE","JO","KZ","KE","KI","KP","KR","KW","KG","LA","LV","LB","LS","LR","LY","LI","LT","LU","MO","MG","MW","MY","MV","ML","MT","MH","MQ","MR","MU","YT","MX","FM","MD","MC","MN","ME","MS","MA","MZ","MM","NA","NR","NP","NL","NC","NZ","NI","NE","NG","NU","NF","MP","NO","OM","PK","PW","PS","PA","PG","PY","PE","PH","PN","PL","PT","PR","QA","MK","RO","RU","RW","RE","BL","SH","KN","LC","MF","PM","VC","WS","SM","ST","SA","SN","RS","SC","SL","SG","SX","SK","SI","SB","SO","ZA","GS","SS","ES","LK","SD","SR","SJ","SE","CH","SY","TW","TJ","TZ","TH","TL","TG","TK","TO","TT","TN","TR","TM","TC","TV","UG","UA","AE","GB","UM","US","UY","UZ","VU","VE","VN","VG","VI","WF","EH","YE","ZM","ZW","AX"],"example":"BR"},"id_doc_type":{"type":"string","enum":["PASSPORT","ID_CARD","DRIVERS"],"example":"PASSPORT"},"id_doc_front_file":{"type":"string","format":"uri"},"id_doc_back_file":{"type":["string","null"],"format":"uri","description":"Only image files are accepted (.jpg, .jpeg, .png)"},"proof_of_address_doc_type":{"type":["string","null"],"enum":["UTILITY_BILL","BANK_STATEMENT","RENTAL_AGREEMENT","TAX_DOCUMENT","GOVERNMENT_CORRESPONDENCE"],"example":"UTILITY_BILL"},"proof_of_address_doc_file":{"type":["string","null"],"format":"uri","description":"Please upload one document that serve as proof of address, this needs to be the same address as the one provided above. Only PDF and image files are accepted (.jpg, .jpeg, .png, .pdf) with a maximum size of 3MB."},"ownership_percentage":{"type":["integer","null"],"minimum":0,"maximum":100,"description":"Ownership percentage of the beneficial owner (0-100)","example":25},"title":{"type":["string","null"],"maxLength":128,"description":"Job title of the owner","example":"CEO"},"tax_type":{"type":["string","null"],"enum":["SSN","ITIN"],"description":"Tax identifier type. Mandatory when country is US; must be SSN or ITIN.","example":"SSN"}},"required":["role","first_name","last_name","date_of_birth","tax_id","address_line_1","city","state_province_region","country","postal_code","id_doc_country","id_doc_type","id_doc_front_file"]}},"incorporation_doc_file":{"type":["string","null"],"format":"uri","description":"Please upload your articles of incorporation below. The articles of incorporation or a certificate of incorporation usually includes information like the company name, business purpose, number of shares offered, value of shares, etc. Only PDF and image files are accepted (.jpg, .jpeg, .png, .pdf) with a maximum size of 3MB."},"proof_of_ownership_doc_file":{"type":["string","null"],"format":"uri","description":"Please upload your proof of ownership below. This document usually includes information like the shareholders names and percentages. Only PDF and image files are accepted (.jpg, .jpeg, .png, .pdf) with a maximum size of 3MB."},"source_of_funds_doc_type":{"type":["string","null"],"enum":["business_income","gambling_proceeds","gifts","government_benefits","inheritance","investment_loans","pension_retirement","salary","sale_of_assets_real_estate","savings","esops","investment_proceeds","someone_else_funds"]},"source_of_funds_doc_file":{"type":["string","null"],"format":"uri"},"selfie_file":{"type":["string","null"],"format":"uri","description":"Only image files are accepted (.jpg, .jpeg, .png)"},"purpose_of_transactions":{"type":["string","null"],"enum":["business_transactions","charitable_donations","investment_purposes","payments_to_friends_or_family_abroad","personal_or_living_expenses","protect_wealth","purchase_good_and_services","receive_payment_for_freelancing","receive_salary","other"]},"purpose_of_transactions_explanation":{"type":["string","null"]},"account_purpose":{"type":["string","null"],"enum":["charitable_donations","ecommerce_retail_payments","investment_purposes","business_expenses","payments_to_friends_or_family_abroad","personal_or_living_expenses","protect_wealth","purchase_goods_and_services","receive_payments_for_goods_and_services","tax_optimization","third_party_money_transmission","payroll","treasury_management","other"]},"account_purpose_other":{"type":["string","null"],"maxLength":512,"description":"Required when account_purpose is \"other\". Max 512 characters."},"business_type":{"type":["string","null"],"enum":["corporation","llc","partnership","sole_proprietorship","trust","non_profit"]},"business_description":{"type":["string","null"],"maxLength":512},"business_industry":{"type":["string","null"],"enum":["111998","112120","113310","115114","541211","541810","541430","541715","541930","561422","561311","561612","561740","561730","236115","236220","237310","238210","811111","812111","812112","532111","624410","541922","811210","812199","611110","611310","611410","611710","211120","212114","221310","562111","562920","213112","522110","522210","522320","523150","523940","523999","524113","813110","813211","813219","551112","721110","722511","722513","561510","713110","713210","712110","711110","711211","621111","621210","622110","623110","621511","623220","541940","621399","621910","541110","311421","337121","322220","339920","334210","339930","312130","334111","334118","325412","339112","336110","336390","315990","313110","339910","516120","513130","512250","519130","711410","711510","531110","531120","531130","531190","531210","531311","531312","531320","531390","454110","445110","455110","457110","449210","444110","459210","459120","445320","458110","458210","458310","455219","424210","456110","446120","541511","541512","541519","518210","511210","517111","517112","517410","481111","483111","485210","488510","484121","493110","423430","423690","423110","423830","423840","423510","424690","424990","424410","424480","423940","541611","541618","541330","541990","541214","561499"]},"estimated_annual_revenue":{"type":["string","null"],"enum":["0_99999","100000_999999","1000000_9999999","10000000_49999999","50000000_249999999","250000000_plus"]},"source_of_wealth":{"type":["string","null"],"enum":["business_dividends_or_profits","investments","asset_sales","client_investor_contributions","gambling","charitable_contributions","inheritance","affiliate_or_royalty_income"]},"publicly_traded":{"type":["boolean","null"]},"occupation":{"type":["string","null"],"maxLength":255},"external_id":{"type":["string","null"]},"tos_id":{"type":["string","null"],"minLength":15,"maxLength":15},"additional_info":{"type":["array","null"],"items":{"type":"object","properties":{"label":{"type":"string","enum":["EIN_LETTER","KYC_PROVIDER_DOCUMENT","FLOW_OF_FUNDS","BANK_STATEMENT","TAX_RETURN","AUDITED_FINANCIALS","OPERATING_AGREEMENT","BOARD_RESOLUTION","CERTIFICATE_OF_GOOD_STANDING","BUSINESS_LICENSE","MSB_LICENSE","POWER_OF_ATTORNEY","TRUST_DEED","SHAREHOLDER_REGISTRY","BENEFICIAL_OWNER_DECLARATION","COMPLIANCE_QUESTIONNAIRE","PROOF_OF_EMPLOYMENT","REFERENCE_LETTER","OTHER"]},"value":{"type":"string","minLength":1}},"required":["label","value"],"example":{"label":"EIN_LETTER","value":"https://example.com/ein.pdf"}},"description":"Optional extra documents or notes for this receiver. `label` is a known category, `value` is either a URL to upload or a free-text description. Any URLs are downloaded and re-hosted on Blindpay storage before being stored."}},"required":["type","kyc_type","email","country"],"description":"Create a new receiver"}},"required":["instance_id"]},
    method: "post",
    pathTemplate: "/v1/instances/{instance_id}/receivers",
    executionParameters: [{"name":"instance_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1EInstancesReceivers", {
    name: "PostV1EInstancesReceivers",
    description: `Create Receiver`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"token":{"type":"string"},"requestBody":{"type":"object","properties":{"type":{"type":"string","enum":["individual","business"]},"kyc_type":{"type":"string","enum":["light","standard","enhanced"]},"email":{"type":"string","format":"email"},"tax_id":{"type":["string","null"]},"address_line_1":{"type":["string","null"]},"address_line_2":{"type":["string","null"]},"city":{"type":["string","null"]},"state_province_region":{"type":["string","null"]},"country":{"type":"string","enum":["AF","AL","DZ","AS","AD","AO","AI","AQ","AG","AR","AM","AW","AU","AT","AZ","BS","BH","BD","BB","BY","BE","BZ","BJ","BM","BT","BO","BQ","BA","BW","BV","BR","IO","BN","BG","BF","BI","CV","KH","CM","CA","KY","CF","TD","CL","CN","CX","CC","CO","KM","CD","CG","CK","CR","HR","CU","CW","CY","CZ","CI","DK","DJ","DM","DO","EC","EG","SV","GQ","ER","EE","SZ","ET","FK","FO","FJ","FI","FR","GF","PF","TF","GA","GM","GE","DE","GH","GI","GR","GL","GD","GP","GU","GT","GG","GN","GW","GY","HT","HM","VA","HN","HK","HU","IS","IN","ID","IR","IQ","IE","IM","IL","IT","JM","JP","JE","JO","KZ","KE","KI","KP","KR","KW","KG","LA","LV","LB","LS","LR","LY","LI","LT","LU","MO","MG","MW","MY","MV","ML","MT","MH","MQ","MR","MU","YT","MX","FM","MD","MC","MN","ME","MS","MA","MZ","MM","NA","NR","NP","NL","NC","NZ","NI","NE","NG","NU","NF","MP","NO","OM","PK","PW","PS","PA","PG","PY","PE","PH","PN","PL","PT","PR","QA","MK","RO","RU","RW","RE","BL","SH","KN","LC","MF","PM","VC","WS","SM","ST","SA","SN","RS","SC","SL","SG","SX","SK","SI","SB","SO","ZA","GS","SS","ES","LK","SD","SR","SJ","SE","CH","SY","TW","TJ","TZ","TH","TL","TG","TK","TO","TT","TN","TR","TM","TC","TV","UG","UA","AE","GB","UM","US","UY","UZ","VU","VE","VN","VG","VI","WF","EH","YE","ZM","ZW","AX"]},"postal_code":{"type":["string","null"]},"ip_address":{"type":["string","null"],"format":"ip"},"image_url":{"type":["string","null"],"format":"uri"},"phone_number":{"type":["string","null"]},"proof_of_address_doc_type":{"type":["string","null"],"enum":["UTILITY_BILL","BANK_STATEMENT","RENTAL_AGREEMENT","TAX_DOCUMENT","GOVERNMENT_CORRESPONDENCE"]},"proof_of_address_doc_file":{"type":["string","null"],"format":"uri","description":"Please upload one document that serve as proof of address, this needs to be the same physical address as the one provided above. Only PDF and image files are accepted (.jpg, .jpeg, .png, .pdf) with a maximum size of 3MB."},"first_name":{"type":["string","null"]},"last_name":{"type":["string","null"]},"date_of_birth":{"anyOf":[{"type":"string","format":"date-time"},{"type":"string"},{"type":"null"}]},"id_doc_country":{"type":["string","null"],"enum":["AF","AL","DZ","AS","AD","AO","AI","AQ","AG","AR","AM","AW","AU","AT","AZ","BS","BH","BD","BB","BY","BE","BZ","BJ","BM","BT","BO","BQ","BA","BW","BV","BR","IO","BN","BG","BF","BI","CV","KH","CM","CA","KY","CF","TD","CL","CN","CX","CC","CO","KM","CD","CG","CK","CR","HR","CU","CW","CY","CZ","CI","DK","DJ","DM","DO","EC","EG","SV","GQ","ER","EE","SZ","ET","FK","FO","FJ","FI","FR","GF","PF","TF","GA","GM","GE","DE","GH","GI","GR","GL","GD","GP","GU","GT","GG","GN","GW","GY","HT","HM","VA","HN","HK","HU","IS","IN","ID","IR","IQ","IE","IM","IL","IT","JM","JP","JE","JO","KZ","KE","KI","KP","KR","KW","KG","LA","LV","LB","LS","LR","LY","LI","LT","LU","MO","MG","MW","MY","MV","ML","MT","MH","MQ","MR","MU","YT","MX","FM","MD","MC","MN","ME","MS","MA","MZ","MM","NA","NR","NP","NL","NC","NZ","NI","NE","NG","NU","NF","MP","NO","OM","PK","PW","PS","PA","PG","PY","PE","PH","PN","PL","PT","PR","QA","MK","RO","RU","RW","RE","BL","SH","KN","LC","MF","PM","VC","WS","SM","ST","SA","SN","RS","SC","SL","SG","SX","SK","SI","SB","SO","ZA","GS","SS","ES","LK","SD","SR","SJ","SE","CH","SY","TW","TJ","TZ","TH","TL","TG","TK","TO","TT","TN","TR","TM","TC","TV","UG","UA","AE","GB","UM","US","UY","UZ","VU","VE","VN","VG","VI","WF","EH","YE","ZM","ZW","AX"]},"id_doc_type":{"type":["string","null"],"enum":["PASSPORT","ID_CARD","DRIVERS"]},"id_doc_front_file":{"type":["string","null"],"format":"uri","description":"Only image files are accepted (.jpg, .jpeg, .png)"},"id_doc_back_file":{"type":["string","null"],"format":"uri","description":"Only image files are accepted (.jpg, .jpeg, .png)"},"legal_name":{"type":["string","null"]},"alternate_name":{"type":["string","null"]},"formation_date":{"anyOf":[{"type":"string","format":"date-time"},{"type":"string"},{"type":"null"}],"format":"date-time"},"website":{"type":["string","null"],"format":"uri"},"owners":{"type":["array","null"],"items":{"type":"object","properties":{"role":{"type":"string","enum":["beneficial_controlling","beneficial_owner","controlling_person"],"description":"A beneficial owner is someone who directly or indirectly owns 25% or more of your business. A controlling person is someone with significant responsibility to control, manage or direct your business (typically a CEO, senior executive officer or equivalent).","example":"beneficial_owner"},"first_name":{"type":"string","minLength":1,"example":"John"},"last_name":{"type":"string","minLength":1,"example":"Doe"},"date_of_birth":{"anyOf":[{"type":"string","format":"date-time"},{"type":"string"}],"example":"1998-01-01T00:00:00Z"},"tax_id":{"type":"string","example":"536804398"},"address_line_1":{"type":"string","example":"738 Plain St"},"address_line_2":{"type":["string","null"],"example":"Building 22"},"city":{"type":"string","example":"Marshfield"},"state_province_region":{"type":"string","example":"MA"},"country":{"type":"string","enum":["AF","AL","DZ","AS","AD","AO","AI","AQ","AG","AR","AM","AW","AU","AT","AZ","BS","BH","BD","BB","BY","BE","BZ","BJ","BM","BT","BO","BQ","BA","BW","BV","BR","IO","BN","BG","BF","BI","CV","KH","CM","CA","KY","CF","TD","CL","CN","CX","CC","CO","KM","CD","CG","CK","CR","HR","CU","CW","CY","CZ","CI","DK","DJ","DM","DO","EC","EG","SV","GQ","ER","EE","SZ","ET","FK","FO","FJ","FI","FR","GF","PF","TF","GA","GM","GE","DE","GH","GI","GR","GL","GD","GP","GU","GT","GG","GN","GW","GY","HT","HM","VA","HN","HK","HU","IS","IN","ID","IR","IQ","IE","IM","IL","IT","JM","JP","JE","JO","KZ","KE","KI","KP","KR","KW","KG","LA","LV","LB","LS","LR","LY","LI","LT","LU","MO","MG","MW","MY","MV","ML","MT","MH","MQ","MR","MU","YT","MX","FM","MD","MC","MN","ME","MS","MA","MZ","MM","NA","NR","NP","NL","NC","NZ","NI","NE","NG","NU","NF","MP","NO","OM","PK","PW","PS","PA","PG","PY","PE","PH","PN","PL","PT","PR","QA","MK","RO","RU","RW","RE","BL","SH","KN","LC","MF","PM","VC","WS","SM","ST","SA","SN","RS","SC","SL","SG","SX","SK","SI","SB","SO","ZA","GS","SS","ES","LK","SD","SR","SJ","SE","CH","SY","TW","TJ","TZ","TH","TL","TG","TK","TO","TT","TN","TR","TM","TC","TV","UG","UA","AE","GB","UM","US","UY","UZ","VU","VE","VN","VG","VI","WF","EH","YE","ZM","ZW","AX"],"example":"US"},"postal_code":{"type":"string","example":"02050"},"id_doc_country":{"type":"string","enum":["AF","AL","DZ","AS","AD","AO","AI","AQ","AG","AR","AM","AW","AU","AT","AZ","BS","BH","BD","BB","BY","BE","BZ","BJ","BM","BT","BO","BQ","BA","BW","BV","BR","IO","BN","BG","BF","BI","CV","KH","CM","CA","KY","CF","TD","CL","CN","CX","CC","CO","KM","CD","CG","CK","CR","HR","CU","CW","CY","CZ","CI","DK","DJ","DM","DO","EC","EG","SV","GQ","ER","EE","SZ","ET","FK","FO","FJ","FI","FR","GF","PF","TF","GA","GM","GE","DE","GH","GI","GR","GL","GD","GP","GU","GT","GG","GN","GW","GY","HT","HM","VA","HN","HK","HU","IS","IN","ID","IR","IQ","IE","IM","IL","IT","JM","JP","JE","JO","KZ","KE","KI","KP","KR","KW","KG","LA","LV","LB","LS","LR","LY","LI","LT","LU","MO","MG","MW","MY","MV","ML","MT","MH","MQ","MR","MU","YT","MX","FM","MD","MC","MN","ME","MS","MA","MZ","MM","NA","NR","NP","NL","NC","NZ","NI","NE","NG","NU","NF","MP","NO","OM","PK","PW","PS","PA","PG","PY","PE","PH","PN","PL","PT","PR","QA","MK","RO","RU","RW","RE","BL","SH","KN","LC","MF","PM","VC","WS","SM","ST","SA","SN","RS","SC","SL","SG","SX","SK","SI","SB","SO","ZA","GS","SS","ES","LK","SD","SR","SJ","SE","CH","SY","TW","TJ","TZ","TH","TL","TG","TK","TO","TT","TN","TR","TM","TC","TV","UG","UA","AE","GB","UM","US","UY","UZ","VU","VE","VN","VG","VI","WF","EH","YE","ZM","ZW","AX"],"example":"BR"},"id_doc_type":{"type":"string","enum":["PASSPORT","ID_CARD","DRIVERS"],"example":"PASSPORT"},"id_doc_front_file":{"type":"string","format":"uri"},"id_doc_back_file":{"type":["string","null"],"format":"uri","description":"Only image files are accepted (.jpg, .jpeg, .png)"},"proof_of_address_doc_type":{"type":["string","null"],"enum":["UTILITY_BILL","BANK_STATEMENT","RENTAL_AGREEMENT","TAX_DOCUMENT","GOVERNMENT_CORRESPONDENCE"],"example":"UTILITY_BILL"},"proof_of_address_doc_file":{"type":["string","null"],"format":"uri","description":"Please upload one document that serve as proof of address, this needs to be the same address as the one provided above. Only PDF and image files are accepted (.jpg, .jpeg, .png, .pdf) with a maximum size of 3MB."},"ownership_percentage":{"type":["integer","null"],"minimum":0,"maximum":100,"description":"Ownership percentage of the beneficial owner (0-100)","example":25},"title":{"type":["string","null"],"maxLength":128,"description":"Job title of the owner","example":"CEO"},"tax_type":{"type":["string","null"],"enum":["SSN","ITIN"],"description":"Tax identifier type. Mandatory when country is US; must be SSN or ITIN.","example":"SSN"}},"required":["role","first_name","last_name","date_of_birth","tax_id","address_line_1","city","state_province_region","country","postal_code","id_doc_country","id_doc_type","id_doc_front_file"]}},"incorporation_doc_file":{"type":["string","null"],"format":"uri","description":"Please upload your articles of incorporation below. The articles of incorporation or a certificate of incorporation usually includes information like the company name, business purpose, number of shares offered, value of shares, etc. Only PDF and image files are accepted (.jpg, .jpeg, .png, .pdf) with a maximum size of 3MB."},"proof_of_ownership_doc_file":{"type":["string","null"],"format":"uri","description":"Please upload your proof of ownership below. This document usually includes information like the shareholders names and percentages. Only PDF and image files are accepted (.jpg, .jpeg, .png, .pdf) with a maximum size of 3MB."},"source_of_funds_doc_type":{"type":["string","null"],"enum":["business_income","gambling_proceeds","gifts","government_benefits","inheritance","investment_loans","pension_retirement","salary","sale_of_assets_real_estate","savings","esops","investment_proceeds","someone_else_funds"]},"source_of_funds_doc_file":{"type":["string","null"],"format":"uri"},"selfie_file":{"type":["string","null"],"format":"uri","description":"Only image files are accepted (.jpg, .jpeg, .png)"},"purpose_of_transactions":{"type":["string","null"],"enum":["business_transactions","charitable_donations","investment_purposes","payments_to_friends_or_family_abroad","personal_or_living_expenses","protect_wealth","purchase_good_and_services","receive_payment_for_freelancing","receive_salary","other"]},"purpose_of_transactions_explanation":{"type":["string","null"]},"account_purpose":{"type":["string","null"],"enum":["charitable_donations","ecommerce_retail_payments","investment_purposes","business_expenses","payments_to_friends_or_family_abroad","personal_or_living_expenses","protect_wealth","purchase_goods_and_services","receive_payments_for_goods_and_services","tax_optimization","third_party_money_transmission","payroll","treasury_management","other"]},"account_purpose_other":{"type":["string","null"],"maxLength":512,"description":"Required when account_purpose is \"other\". Max 512 characters."},"business_type":{"type":["string","null"],"enum":["corporation","llc","partnership","sole_proprietorship","trust","non_profit"]},"business_description":{"type":["string","null"],"maxLength":512},"business_industry":{"type":["string","null"],"enum":["111998","112120","113310","115114","541211","541810","541430","541715","541930","561422","561311","561612","561740","561730","236115","236220","237310","238210","811111","812111","812112","532111","624410","541922","811210","812199","611110","611310","611410","611710","211120","212114","221310","562111","562920","213112","522110","522210","522320","523150","523940","523999","524113","813110","813211","813219","551112","721110","722511","722513","561510","713110","713210","712110","711110","711211","621111","621210","622110","623110","621511","623220","541940","621399","621910","541110","311421","337121","322220","339920","334210","339930","312130","334111","334118","325412","339112","336110","336390","315990","313110","339910","516120","513130","512250","519130","711410","711510","531110","531120","531130","531190","531210","531311","531312","531320","531390","454110","445110","455110","457110","449210","444110","459210","459120","445320","458110","458210","458310","455219","424210","456110","446120","541511","541512","541519","518210","511210","517111","517112","517410","481111","483111","485210","488510","484121","493110","423430","423690","423110","423830","423840","423510","424690","424990","424410","424480","423940","541611","541618","541330","541990","541214","561499"]},"estimated_annual_revenue":{"type":["string","null"],"enum":["0_99999","100000_999999","1000000_9999999","10000000_49999999","50000000_249999999","250000000_plus"]},"source_of_wealth":{"type":["string","null"],"enum":["business_dividends_or_profits","investments","asset_sales","client_investor_contributions","gambling","charitable_contributions","inheritance","affiliate_or_royalty_income"]},"publicly_traded":{"type":["boolean","null"]},"occupation":{"type":["string","null"],"maxLength":255},"external_id":{"type":["string","null"]},"tos_id":{"type":["string","null"],"minLength":15,"maxLength":15},"additional_info":{"type":["array","null"],"items":{"type":"object","properties":{"label":{"type":"string","enum":["EIN_LETTER","KYC_PROVIDER_DOCUMENT","FLOW_OF_FUNDS","BANK_STATEMENT","TAX_RETURN","AUDITED_FINANCIALS","OPERATING_AGREEMENT","BOARD_RESOLUTION","CERTIFICATE_OF_GOOD_STANDING","BUSINESS_LICENSE","MSB_LICENSE","POWER_OF_ATTORNEY","TRUST_DEED","SHAREHOLDER_REGISTRY","BENEFICIAL_OWNER_DECLARATION","COMPLIANCE_QUESTIONNAIRE","PROOF_OF_EMPLOYMENT","REFERENCE_LETTER","OTHER"]},"value":{"type":"string","minLength":1}},"required":["label","value"],"example":{"label":"EIN_LETTER","value":"https://example.com/ein.pdf"}},"description":"Optional extra documents or notes for this receiver. `label` is a known category, `value` is either a URL to upload or a free-text description. Any URLs are downloaded and re-hosted on Blindpay storage before being stored."}},"required":["type","kyc_type","email","country"],"description":"Create a new receiver"}},"required":["instance_id","token"]},
    method: "post",
    pathTemplate: "/v1/e/instances/{instance_id}/receivers",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"token","in":"query"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1InstancesReceiversById", {
    name: "GetV1InstancesReceiversById",
    description: `Retrieve Receiver`,
    inputSchema: {"type":"object","properties":{"id":{"type":"string","minLength":15,"maxLength":15},"instance_id":{"type":"string","minLength":15,"maxLength":15}},"required":["id","instance_id"]},
    method: "get",
    pathTemplate: "/v1/instances/{instance_id}/receivers/{id}",
    executionParameters: [{"name":"id","in":"path"},{"name":"instance_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PutV1InstancesReceiversById", {
    name: "PutV1InstancesReceiversById",
    description: `Update Receiver`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"id":{"type":"string","minLength":15,"maxLength":15},"requestBody":{"type":"object","properties":{"email":{"type":"string","format":"email"},"tax_id":{"type":["string","null"]},"address_line_1":{"type":["string","null"]},"address_line_2":{"type":["string","null"]},"city":{"type":["string","null"]},"state_province_region":{"type":["string","null"]},"country":{"type":"string","enum":["AF","AL","DZ","AS","AD","AO","AI","AQ","AG","AR","AM","AW","AU","AT","AZ","BS","BH","BD","BB","BY","BE","BZ","BJ","BM","BT","BO","BQ","BA","BW","BV","BR","IO","BN","BG","BF","BI","CV","KH","CM","CA","KY","CF","TD","CL","CN","CX","CC","CO","KM","CD","CG","CK","CR","HR","CU","CW","CY","CZ","CI","DK","DJ","DM","DO","EC","EG","SV","GQ","ER","EE","SZ","ET","FK","FO","FJ","FI","FR","GF","PF","TF","GA","GM","GE","DE","GH","GI","GR","GL","GD","GP","GU","GT","GG","GN","GW","GY","HT","HM","VA","HN","HK","HU","IS","IN","ID","IR","IQ","IE","IM","IL","IT","JM","JP","JE","JO","KZ","KE","KI","KP","KR","KW","KG","LA","LV","LB","LS","LR","LY","LI","LT","LU","MO","MG","MW","MY","MV","ML","MT","MH","MQ","MR","MU","YT","MX","FM","MD","MC","MN","ME","MS","MA","MZ","MM","NA","NR","NP","NL","NC","NZ","NI","NE","NG","NU","NF","MP","NO","OM","PK","PW","PS","PA","PG","PY","PE","PH","PN","PL","PT","PR","QA","MK","RO","RU","RW","RE","BL","SH","KN","LC","MF","PM","VC","WS","SM","ST","SA","SN","RS","SC","SL","SG","SX","SK","SI","SB","SO","ZA","GS","SS","ES","LK","SD","SR","SJ","SE","CH","SY","TW","TJ","TZ","TH","TL","TG","TK","TO","TT","TN","TR","TM","TC","TV","UG","UA","AE","GB","UM","US","UY","UZ","VU","VE","VN","VG","VI","WF","EH","YE","ZM","ZW","AX"]},"postal_code":{"type":["string","null"]},"ip_address":{"type":["string","null"],"format":"ip"},"image_url":{"type":["string","null"],"format":"uri"},"phone_number":{"type":["string","null"]},"proof_of_address_doc_type":{"type":["string","null"],"enum":["UTILITY_BILL","BANK_STATEMENT","RENTAL_AGREEMENT","TAX_DOCUMENT","GOVERNMENT_CORRESPONDENCE"]},"proof_of_address_doc_file":{"type":["string","null"],"format":"uri","description":"Please upload one document that serve as proof of address, this needs to be the same physical address as the one provided above. Only PDF and image files are accepted (.jpg, .jpeg, .png, .pdf) with a maximum size of 3MB."},"first_name":{"type":["string","null"]},"last_name":{"type":["string","null"]},"date_of_birth":{"anyOf":[{"type":"string","format":"date-time"},{"type":"string"},{"type":"null"}]},"id_doc_country":{"type":["string","null"],"enum":["AF","AL","DZ","AS","AD","AO","AI","AQ","AG","AR","AM","AW","AU","AT","AZ","BS","BH","BD","BB","BY","BE","BZ","BJ","BM","BT","BO","BQ","BA","BW","BV","BR","IO","BN","BG","BF","BI","CV","KH","CM","CA","KY","CF","TD","CL","CN","CX","CC","CO","KM","CD","CG","CK","CR","HR","CU","CW","CY","CZ","CI","DK","DJ","DM","DO","EC","EG","SV","GQ","ER","EE","SZ","ET","FK","FO","FJ","FI","FR","GF","PF","TF","GA","GM","GE","DE","GH","GI","GR","GL","GD","GP","GU","GT","GG","GN","GW","GY","HT","HM","VA","HN","HK","HU","IS","IN","ID","IR","IQ","IE","IM","IL","IT","JM","JP","JE","JO","KZ","KE","KI","KP","KR","KW","KG","LA","LV","LB","LS","LR","LY","LI","LT","LU","MO","MG","MW","MY","MV","ML","MT","MH","MQ","MR","MU","YT","MX","FM","MD","MC","MN","ME","MS","MA","MZ","MM","NA","NR","NP","NL","NC","NZ","NI","NE","NG","NU","NF","MP","NO","OM","PK","PW","PS","PA","PG","PY","PE","PH","PN","PL","PT","PR","QA","MK","RO","RU","RW","RE","BL","SH","KN","LC","MF","PM","VC","WS","SM","ST","SA","SN","RS","SC","SL","SG","SX","SK","SI","SB","SO","ZA","GS","SS","ES","LK","SD","SR","SJ","SE","CH","SY","TW","TJ","TZ","TH","TL","TG","TK","TO","TT","TN","TR","TM","TC","TV","UG","UA","AE","GB","UM","US","UY","UZ","VU","VE","VN","VG","VI","WF","EH","YE","ZM","ZW","AX"]},"id_doc_type":{"type":["string","null"],"enum":["PASSPORT","ID_CARD","DRIVERS"]},"id_doc_front_file":{"type":["string","null"],"format":"uri","description":"Only image files are accepted (.jpg, .jpeg, .png)"},"id_doc_back_file":{"type":["string","null"],"format":"uri","description":"Only image files are accepted (.jpg, .jpeg, .png)"},"legal_name":{"type":["string","null"]},"alternate_name":{"type":["string","null"]},"formation_date":{"anyOf":[{"type":"string","format":"date-time"},{"type":"string"},{"type":"null"}],"format":"date-time"},"website":{"type":["string","null"],"format":"uri"},"owners":{"type":["array","null"],"items":{"type":"object","properties":{"role":{"type":"string","enum":["beneficial_controlling","beneficial_owner","controlling_person"],"description":"A beneficial owner is someone who directly or indirectly owns 25% or more of your business. A controlling person is someone with significant responsibility to control, manage or direct your business (typically a CEO, senior executive officer or equivalent).","example":"beneficial_owner"},"first_name":{"type":"string","minLength":1,"example":"John"},"last_name":{"type":"string","minLength":1,"example":"Doe"},"date_of_birth":{"anyOf":[{"type":"string","format":"date-time"},{"type":"string"}],"example":"1998-01-01T00:00:00Z"},"tax_id":{"type":"string","example":"536804398"},"address_line_1":{"type":"string","example":"738 Plain St"},"address_line_2":{"type":["string","null"],"example":"Building 22"},"city":{"type":"string","example":"Marshfield"},"state_province_region":{"type":"string","example":"MA"},"country":{"type":"string","enum":["AF","AL","DZ","AS","AD","AO","AI","AQ","AG","AR","AM","AW","AU","AT","AZ","BS","BH","BD","BB","BY","BE","BZ","BJ","BM","BT","BO","BQ","BA","BW","BV","BR","IO","BN","BG","BF","BI","CV","KH","CM","CA","KY","CF","TD","CL","CN","CX","CC","CO","KM","CD","CG","CK","CR","HR","CU","CW","CY","CZ","CI","DK","DJ","DM","DO","EC","EG","SV","GQ","ER","EE","SZ","ET","FK","FO","FJ","FI","FR","GF","PF","TF","GA","GM","GE","DE","GH","GI","GR","GL","GD","GP","GU","GT","GG","GN","GW","GY","HT","HM","VA","HN","HK","HU","IS","IN","ID","IR","IQ","IE","IM","IL","IT","JM","JP","JE","JO","KZ","KE","KI","KP","KR","KW","KG","LA","LV","LB","LS","LR","LY","LI","LT","LU","MO","MG","MW","MY","MV","ML","MT","MH","MQ","MR","MU","YT","MX","FM","MD","MC","MN","ME","MS","MA","MZ","MM","NA","NR","NP","NL","NC","NZ","NI","NE","NG","NU","NF","MP","NO","OM","PK","PW","PS","PA","PG","PY","PE","PH","PN","PL","PT","PR","QA","MK","RO","RU","RW","RE","BL","SH","KN","LC","MF","PM","VC","WS","SM","ST","SA","SN","RS","SC","SL","SG","SX","SK","SI","SB","SO","ZA","GS","SS","ES","LK","SD","SR","SJ","SE","CH","SY","TW","TJ","TZ","TH","TL","TG","TK","TO","TT","TN","TR","TM","TC","TV","UG","UA","AE","GB","UM","US","UY","UZ","VU","VE","VN","VG","VI","WF","EH","YE","ZM","ZW","AX"],"example":"US"},"postal_code":{"type":"string","example":"02050"},"id_doc_country":{"type":"string","enum":["AF","AL","DZ","AS","AD","AO","AI","AQ","AG","AR","AM","AW","AU","AT","AZ","BS","BH","BD","BB","BY","BE","BZ","BJ","BM","BT","BO","BQ","BA","BW","BV","BR","IO","BN","BG","BF","BI","CV","KH","CM","CA","KY","CF","TD","CL","CN","CX","CC","CO","KM","CD","CG","CK","CR","HR","CU","CW","CY","CZ","CI","DK","DJ","DM","DO","EC","EG","SV","GQ","ER","EE","SZ","ET","FK","FO","FJ","FI","FR","GF","PF","TF","GA","GM","GE","DE","GH","GI","GR","GL","GD","GP","GU","GT","GG","GN","GW","GY","HT","HM","VA","HN","HK","HU","IS","IN","ID","IR","IQ","IE","IM","IL","IT","JM","JP","JE","JO","KZ","KE","KI","KP","KR","KW","KG","LA","LV","LB","LS","LR","LY","LI","LT","LU","MO","MG","MW","MY","MV","ML","MT","MH","MQ","MR","MU","YT","MX","FM","MD","MC","MN","ME","MS","MA","MZ","MM","NA","NR","NP","NL","NC","NZ","NI","NE","NG","NU","NF","MP","NO","OM","PK","PW","PS","PA","PG","PY","PE","PH","PN","PL","PT","PR","QA","MK","RO","RU","RW","RE","BL","SH","KN","LC","MF","PM","VC","WS","SM","ST","SA","SN","RS","SC","SL","SG","SX","SK","SI","SB","SO","ZA","GS","SS","ES","LK","SD","SR","SJ","SE","CH","SY","TW","TJ","TZ","TH","TL","TG","TK","TO","TT","TN","TR","TM","TC","TV","UG","UA","AE","GB","UM","US","UY","UZ","VU","VE","VN","VG","VI","WF","EH","YE","ZM","ZW","AX"],"example":"BR"},"id_doc_type":{"type":"string","enum":["PASSPORT","ID_CARD","DRIVERS"],"example":"PASSPORT"},"id_doc_front_file":{"type":"string","format":"uri"},"id_doc_back_file":{"type":["string","null"],"format":"uri","description":"Only image files are accepted (.jpg, .jpeg, .png)"},"proof_of_address_doc_type":{"type":["string","null"],"enum":["UTILITY_BILL","BANK_STATEMENT","RENTAL_AGREEMENT","TAX_DOCUMENT","GOVERNMENT_CORRESPONDENCE"],"example":"UTILITY_BILL"},"proof_of_address_doc_file":{"type":["string","null"],"format":"uri","description":"Please upload one document that serve as proof of address, this needs to be the same address as the one provided above. Only PDF and image files are accepted (.jpg, .jpeg, .png, .pdf) with a maximum size of 3MB."},"ownership_percentage":{"type":["integer","null"],"minimum":0,"maximum":100,"description":"Ownership percentage of the beneficial owner (0-100)","example":25},"title":{"type":["string","null"],"maxLength":128,"description":"Job title of the owner","example":"CEO"},"tax_type":{"type":["string","null"],"enum":["SSN","ITIN"],"description":"Tax identifier type. Mandatory when country is US; must be SSN or ITIN.","example":"SSN"},"id":{"type":"string","minLength":15,"maxLength":15}},"required":["id"]}},"incorporation_doc_file":{"type":["string","null"],"format":"uri","description":"Please upload your articles of incorporation below. The articles of incorporation or a certificate of incorporation usually includes information like the company name, business purpose, number of shares offered, value of shares, etc. Only PDF and image files are accepted (.jpg, .jpeg, .png, .pdf) with a maximum size of 3MB."},"proof_of_ownership_doc_file":{"type":["string","null"],"format":"uri","description":"Please upload your proof of ownership below. This document usually includes information like the shareholders names and percentages. Only PDF and image files are accepted (.jpg, .jpeg, .png, .pdf) with a maximum size of 3MB."},"source_of_funds_doc_type":{"type":["string","null"],"enum":["business_income","gambling_proceeds","gifts","government_benefits","inheritance","investment_loans","pension_retirement","salary","sale_of_assets_real_estate","savings","esops","investment_proceeds","someone_else_funds"]},"source_of_funds_doc_file":{"type":["string","null"],"format":"uri"},"selfie_file":{"type":["string","null"],"format":"uri","description":"Only image files are accepted (.jpg, .jpeg, .png)"},"purpose_of_transactions":{"type":["string","null"],"enum":["business_transactions","charitable_donations","investment_purposes","payments_to_friends_or_family_abroad","personal_or_living_expenses","protect_wealth","purchase_good_and_services","receive_payment_for_freelancing","receive_salary","other"]},"purpose_of_transactions_explanation":{"type":["string","null"]},"account_purpose":{"type":["string","null"],"enum":["charitable_donations","ecommerce_retail_payments","investment_purposes","business_expenses","payments_to_friends_or_family_abroad","personal_or_living_expenses","protect_wealth","purchase_goods_and_services","receive_payments_for_goods_and_services","tax_optimization","third_party_money_transmission","payroll","treasury_management","other"]},"account_purpose_other":{"type":["string","null"],"maxLength":512,"description":"Required when account_purpose is \"other\". Max 512 characters."},"business_type":{"type":["string","null"],"enum":["corporation","llc","partnership","sole_proprietorship","trust","non_profit"]},"business_description":{"type":["string","null"],"maxLength":512},"business_industry":{"type":["string","null"],"enum":["111998","112120","113310","115114","541211","541810","541430","541715","541930","561422","561311","561612","561740","561730","236115","236220","237310","238210","811111","812111","812112","532111","624410","541922","811210","812199","611110","611310","611410","611710","211120","212114","221310","562111","562920","213112","522110","522210","522320","523150","523940","523999","524113","813110","813211","813219","551112","721110","722511","722513","561510","713110","713210","712110","711110","711211","621111","621210","622110","623110","621511","623220","541940","621399","621910","541110","311421","337121","322220","339920","334210","339930","312130","334111","334118","325412","339112","336110","336390","315990","313110","339910","516120","513130","512250","519130","711410","711510","531110","531120","531130","531190","531210","531311","531312","531320","531390","454110","445110","455110","457110","449210","444110","459210","459120","445320","458110","458210","458310","455219","424210","456110","446120","541511","541512","541519","518210","511210","517111","517112","517410","481111","483111","485210","488510","484121","493110","423430","423690","423110","423830","423840","423510","424690","424990","424410","424480","423940","541611","541618","541330","541990","541214","561499"]},"estimated_annual_revenue":{"type":["string","null"],"enum":["0_99999","100000_999999","1000000_9999999","10000000_49999999","50000000_249999999","250000000_plus"]},"source_of_wealth":{"type":["string","null"],"enum":["business_dividends_or_profits","investments","asset_sales","client_investor_contributions","gambling","charitable_contributions","inheritance","affiliate_or_royalty_income"]},"publicly_traded":{"type":["boolean","null"]},"occupation":{"type":["string","null"],"maxLength":255},"external_id":{"type":["string","null"]},"tos_id":{"type":["string","null"],"minLength":15,"maxLength":15},"additional_info":{"type":["array","null"],"items":{"type":"object","properties":{"label":{"type":"string","enum":["EIN_LETTER","KYC_PROVIDER_DOCUMENT","FLOW_OF_FUNDS","BANK_STATEMENT","TAX_RETURN","AUDITED_FINANCIALS","OPERATING_AGREEMENT","BOARD_RESOLUTION","CERTIFICATE_OF_GOOD_STANDING","BUSINESS_LICENSE","MSB_LICENSE","POWER_OF_ATTORNEY","TRUST_DEED","SHAREHOLDER_REGISTRY","BENEFICIAL_OWNER_DECLARATION","COMPLIANCE_QUESTIONNAIRE","PROOF_OF_EMPLOYMENT","REFERENCE_LETTER","OTHER"]},"value":{"type":"string","minLength":1}},"required":["label","value"],"example":{"label":"EIN_LETTER","value":"https://example.com/ein.pdf"}},"description":"Optional extra documents or notes for this receiver. `label` is a known category, `value` is either a URL to upload or a free-text description. Any URLs are downloaded and re-hosted on Blindpay storage before being stored."}},"required":["email","country"],"description":"Update a receiver"}},"required":["instance_id","id"]},
    method: "put",
    pathTemplate: "/v1/instances/{instance_id}/receivers/{id}",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["DeleteV1InstancesReceiversById", {
    name: "DeleteV1InstancesReceiversById",
    description: `Delete Receiver`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"id":{"type":"string","minLength":15,"maxLength":15}},"required":["instance_id","id"]},
    method: "delete",
    pathTemplate: "/v1/instances/{instance_id}/receivers/{id}",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1InstancesLimitsReceiversById", {
    name: "GetV1InstancesLimitsReceiversById",
    description: `Retrieve Receiver Limits`,
    inputSchema: {"type":"object","properties":{"id":{"type":"string","minLength":15,"maxLength":15},"instance_id":{"type":"string","minLength":15,"maxLength":15}},"required":["id","instance_id"]},
    method: "get",
    pathTemplate: "/v1/instances/{instance_id}/limits/receivers/{id}",
    executionParameters: [{"name":"id","in":"path"},{"name":"instance_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1InstancesReceiversBankAccounts", {
    name: "GetV1InstancesReceiversBankAccounts",
    description: `Retrieve Bank Accounts`,
    inputSchema: {"type":"object","properties":{"receiver_id":{"type":"string","minLength":15,"maxLength":15},"instance_id":{"type":"string","minLength":15,"maxLength":15},"status":{"type":"string","enum":["verifying","approved","rejected","deprecated"]},"type":{"type":"string","enum":["wire","ach","pix","pix_safe","ted","spei_bitso","transfers_bitso","ach_cop_bitso","international_swift","rtp","sepa"]},"name":{"type":"string"},"bank_account_id":{"type":"string"},"country":{"type":"string"}},"required":["receiver_id","instance_id"]},
    method: "get",
    pathTemplate: "/v1/instances/{instance_id}/receivers/{receiver_id}/bank-accounts",
    executionParameters: [{"name":"receiver_id","in":"path"},{"name":"instance_id","in":"path"},{"name":"status","in":"query"},{"name":"type","in":"query"},{"name":"name","in":"query"},{"name":"bank_account_id","in":"query"},{"name":"country","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1InstancesReceiversBankAccounts", {
    name: "PostV1InstancesReceiversBankAccounts",
    description: `Add Bank Account`,
    inputSchema: {"type":"object","properties":{"receiver_id":{"type":"string","minLength":15,"maxLength":15},"instance_id":{"type":"string","minLength":15,"maxLength":15},"requestBody":{"type":"object","properties":{"type":{"type":"string","enum":["wire","ach","pix","pix_safe","ted","spei_bitso","transfers_bitso","ach_cop_bitso","international_swift","rtp","sepa"]},"name":{"type":"string"},"status":{"type":["string","null"],"enum":["verifying","approved","rejected","deprecated"]},"recipient_relationship":{"type":["string","null"],"enum":["first_party","employee","independent_contractor","vendor_or_supplier","subsidiary_or_affiliate","merchant_or_partner","customer","landlord","family","other"]},"swift_payment_code":{"type":["string","null"],"enum":["ae_swift_str","ae_swift_tcs","ae_swift_ipc","ae_swift_ifs","ae_swift_sts","ae_swift_pms","ae_swift_its","ae_swift_gde","ae_swift_ots","ae_swift_tts","bh_swift_afa","bh_swift_afl","bh_swift_ats","bh_swift_cea","bh_swift_cel","bh_swift_chc","bh_swift_dla","bh_swift_dlf","bh_swift_dll","bh_swift_doe","bh_swift_dsa","bh_swift_dsf","bh_swift_dsl","bh_swift_fam","bh_swift_fda","bh_swift_fdl","bh_swift_fia","bh_swift_fil","bh_swift_fis","bh_swift_fsa","bh_swift_fsl","bh_swift_gde","bh_swift_gdi","bh_swift_gms","bh_swift_gos","bh_swift_gri","bh_swift_ifs","bh_swift_igd","bh_swift_iid","bh_swift_ins","bh_swift_iod","bh_swift_iol","bh_swift_ipc","bh_swift_ish","bh_swift_isl","bh_swift_iss","bh_swift_its","bh_swift_ldl","bh_swift_lds","bh_swift_lea","bh_swift_lel","bh_swift_lla","bh_swift_lll","bh_swift_ots","bh_swift_pip","bh_swift_pms","bh_swift_ppa","bh_swift_ppl","bh_swift_prr","bh_swift_prs","bh_swift_rda","bh_swift_rdl","bh_swift_rds","bh_swift_rea","bh_swift_rel","bh_swift_rfs","bh_swift_rls","bh_swift_sal","bh_swift_sco","bh_swift_sla","bh_swift_sll","bh_swift_str","bh_swift_sts","bh_swift_tcp","bh_swift_tcr","bh_swift_tcs","bh_swift_tts","ch_swift_ccdndr","ch_swift_cctfdr","ch_swift_cgoddr","ch_swift_cocadr","ch_swift_cstrdr","ch_swift_remtdr","cn_swift_ccdndr","cn_swift_cctfdr","cn_swift_cgoddr","cn_swift_cocadr","cn_swift_cstrdr","cn_swift_remtdr","hk_swift_charitabledonation","hk_swift_goods","hk_swift_personal","hk_swift_services","id_swift_2011","id_swift_2012","id_swift_2015","id_swift_2018","id_swift_2019","id_swift_2097","id_swift_2098","id_swift_2127","id_swift_2129","id_swift_2150","id_swift_2163","id_swift_2193","id_swift_2194","id_swift_2197","id_swift_2198","id_swift_2203","id_swift_2204","id_swift_2206","id_swift_2207","id_swift_2221","id_swift_2222","id_swift_2231","id_swift_2232","id_swift_2233","id_swift_2240","id_swift_2241","id_swift_2242","id_swift_2243","id_swift_2244","id_swift_2245","id_swift_2246","id_swift_2247","id_swift_2251","id_swift_2252","id_swift_2255","id_swift_2256","id_swift_2257","id_swift_2261","id_swift_2262","id_swift_2263","id_swift_2264","id_swift_2271","id_swift_2272","id_swift_2273","id_swift_2274","id_swift_2275","id_swift_2276","id_swift_2277","id_swift_2278","id_swift_2279","id_swift_2280","id_swift_2282","id_swift_2299","id_swift_2311","id_swift_2321","id_swift_2322","id_swift_2323","id_swift_2331","id_swift_2332","id_swift_2333","id_swift_2341","id_swift_2342","id_swift_2351","id_swift_2352","id_swift_2353","id_swift_2354","id_swift_2361","id_swift_2362","id_swift_2363","id_swift_2364","id_swift_2365","id_swift_2366","id_swift_2371","id_swift_2372","id_swift_2375","id_swift_2376","id_swift_2377","id_swift_2378","id_swift_2379","id_swift_2380","id_swift_2381","id_swift_2382","id_swift_2383","id_swift_2384","id_swift_2385","id_swift_2386","id_swift_2387","id_swift_2388","id_swift_2389","id_swift_2390","id_swift_2391","id_swift_2392","id_swift_2393","id_swift_2394","id_swift_2395","id_swift_2396","id_swift_2397","id_swift_2398","id_swift_2400","id_swift_2405","id_swift_2411","id_swift_2412","id_swift_2413","id_swift_2421","id_swift_2422","id_swift_2423","id_swift_2431","id_swift_2432","id_swift_2433","id_swift_2441","id_swift_2442","id_swift_2443","id_swift_2450","id_swift_2461","id_swift_2462","id_swift_2466","id_swift_2467","id_swift_2468","id_swift_2469","id_swift_2480","id_swift_2490","id_swift_2495","id_swift_2501","id_swift_2502","id_swift_2511","id_swift_2512","id_swift_2521","id_swift_2522","id_swift_2523","id_swift_2524","id_swift_2525","id_swift_2526","id_swift_2531","id_swift_2532","id_swift_2533","id_swift_2541","id_swift_2546","id_swift_2547","id_swift_2550","id_swift_2560","id_swift_2570","id_swift_2580","id_swift_2590","id_swift_2600","id_swift_2610","id_swift_2615","id_swift_2616","id_swift_2630","id_swift_2640","id_swift_2651","id_swift_2652","id_swift_2660","id_swift_2670","id_swift_2701","id_swift_2702","id_swift_2705","id_swift_2710","id_swift_2716","id_swift_2717","id_swift_2720","id_swift_2725","id_swift_2730","id_swift_2731","id_swift_2741","id_swift_2742","id_swift_2743","id_swift_2751","id_swift_2752","id_swift_2760","id_swift_2765","id_swift_2766","id_swift_2767","id_swift_2770","id_swift_2802","id_swift_2803","id_swift_2804","id_swift_2808","id_swift_2809","id_swift_2811","id_swift_2812","id_swift_2813","id_swift_2814","id_swift_2815","id_swift_2821","id_swift_2822","id_swift_2823","id_swift_2824","id_swift_2825","id_swift_2826","id_swift_2827","id_swift_2828","in_swift_p0001","in_swift_p0002","in_swift_p0003","in_swift_p0004","in_swift_p0005","in_swift_p0006","in_swift_p0007","in_swift_p0008","in_swift_p0009","in_swift_p0010","in_swift_p0011","in_swift_p0012","in_swift_p0013","in_swift_p0014","in_swift_p0015","in_swift_p0016","in_swift_p0017","in_swift_p0019","in_swift_p0020","in_swift_p0021","in_swift_p0022","in_swift_p0024","in_swift_p0025","in_swift_p0028","in_swift_p0029","in_swift_p0099","in_swift_p0101","in_swift_p0102","in_swift_p0103","in_swift_p0104","in_swift_p0105","in_swift_p0107","in_swift_p0108","in_swift_p0109","jp_swift_1001","jp_swift_1002","jp_swift_1003","jp_swift_1004","jp_swift_101","jp_swift_102","jp_swift_103","jp_swift_104","jp_swift_105","jp_swift_106","jp_swift_107","jp_swift_108","jp_swift_109","jp_swift_110","jp_swift_1101","jp_swift_1102","jp_swift_1103","jp_swift_1104","jp_swift_1105","jp_swift_1106","jp_swift_1107","jp_swift_1108","jp_swift_1109","jp_swift_111","jp_swift_1110","jp_swift_1111","jp_swift_1112","jp_swift_1201","jp_swift_1202","jp_swift_201","jp_swift_202","jp_swift_203","jp_swift_204","jp_swift_205","jp_swift_206","jp_swift_207","jp_swift_208","jp_swift_209","jp_swift_301","jp_swift_302","jp_swift_303","jp_swift_304","jp_swift_305","jp_swift_306","jp_swift_307","jp_swift_401","jp_swift_402","jp_swift_403","jp_swift_404","jp_swift_501","jp_swift_502","jp_swift_503","jp_swift_504","jp_swift_601","jp_swift_602","jp_swift_603","jp_swift_604","jp_swift_701","jp_swift_702","jp_swift_703","jp_swift_704","jp_swift_705","jp_swift_801","jp_swift_802","jp_swift_803","jp_swift_804","jp_swift_805","jp_swift_806","jp_swift_807","jp_swift_808","jp_swift_809","jp_swift_810","jp_swift_811","jp_swift_812","jp_swift_813","jp_swift_814","jp_swift_815","jp_swift_816","jp_swift_817","jp_swift_818","jp_swift_901","jp_swift_902","jp_swift_903","jp_swift_904","ke_swift_1001","ke_swift_1002","ke_swift_1101","ke_swift_1102","ke_swift_1201","ke_swift_1202","ke_swift_1206","ke_swift_1501","ke_swift_1518","ke_swift_1519","ke_swift_1527","ke_swift_1801","ke_swift_1802","ke_swift_1908","ke_swift_2101","ke_swift_2301","ke_swift_2501","ke_swift_2901","ke_swift_3001","ke_swift_3100","ke_swift_3101","ke_swift_3103","ke_swift_3200","ke_swift_3304","ke_swift_3509","ke_swift_3514","ke_swift_3801","ke_swift_4103","ke_swift_4301","ke_swift_4601","ke_swift_4702","ke_swift_512","ke_swift_6001","ke_swift_6002","ke_swift_6101","ke_swift_6102","ke_swift_6301","ke_swift_6401","ke_swift_6402","ke_swift_6501","ke_swift_6601","ke_swift_adtx","ke_swift_airb","ke_swift_artx","ke_swift_bech","ke_swift_bsd","ke_swift_bttx","ke_swift_busb","ke_swift_ccmc","ke_swift_cere","ke_swift_cfr","ke_swift_cgtx","ke_swift_chc","ke_swift_clot","ke_swift_comu","ke_swift_cons","ke_swift_cort","ke_swift_cotx","ke_swift_csdk","ke_swift_divd","ke_swift_edtx","ke_swift_educ","ke_swift_farm","ke_swift_foex","ke_swift_fuel","ke_swift_gokx","ke_swift_govt","ke_swift_hlfd","ke_swift_hlti","ke_swift_holi","ke_swift_ibld","ke_swift_inpc","ke_swift_insu","ke_swift_inte","ke_swift_intx","ke_swift_invs","ke_swift_istx","ke_swift_licf","ke_swift_lifi","ke_swift_loan","ke_swift_mach","ke_swift_mafc","ke_swift_mdcs","ke_swift_merc","ke_swift_paye","ke_swift_pena","ke_swift_pl39","ke_swift_pl40","ke_swift_pl41","ke_swift_pl42","ke_swift_pl43","ke_swift_pl44","ke_swift_pl45","ke_swift_pl46","ke_swift_pl47","ke_swift_pl48","ke_swift_pl49","ke_swift_pl50","ke_swift_pl51","ke_swift_pl52","ke_swift_pl53","ke_swift_ppti","ke_swift_prpy","ke_swift_psco","ke_swift_refu","ke_swift_relg","ke_swift_rent","ke_swift_ritx","ke_swift_rlwy","ke_swift_sala","ke_swift_savg","ke_swift_scho","ke_swift_sdtx","ke_swift_ship","ke_swift_swlf","ke_swift_taxr","ke_swift_taxs","ke_swift_tbil","ke_swift_tith","ke_swift_totx","ke_swift_trac","ke_swift_ubil","ke_swift_vatx","ke_swift_vipn","ke_swift_whld","ph_swift_1010101000","ph_swift_1010102001","ph_swift_1010102002","ph_swift_1010103001","ph_swift_1010103002","ph_swift_1010201000","ph_swift_1010202001","ph_swift_1010202002","ph_swift_1010203001","ph_swift_1010203002","ph_swift_1010300000","ph_swift_1110100001","ph_swift_1110200001","ph_swift_1110200002","ph_swift_1110200003","ph_swift_1110200004","ph_swift_1110300001","ph_swift_1110300002","ph_swift_1110300003","ph_swift_1110300004","ph_swift_1110400001","ph_swift_1110400002","ph_swift_1110400003","ph_swift_1110400004","ph_swift_1110400005","ph_swift_1110400006","ph_swift_1110500001","ph_swift_1110500002","ph_swift_1110500003","ph_swift_1110500004","ph_swift_1110500005","ph_swift_1110600001","ph_swift_1110700001","ph_swift_1310000001","ph_swift_1310000002","ph_swift_1310000003","ph_swift_1410100001","ph_swift_1410100002","ph_swift_1410200001","ph_swift_1410200002","ph_swift_1410200003","ph_swift_1410200004","ph_swift_1410300000","ph_swift_1410400000","ph_swift_1410500000","ph_swift_1410600000","ph_swift_1510000001","ph_swift_1510000002","ph_swift_1510000003","ph_swift_1510000004","ph_swift_1510000005","ph_swift_1510000006","ph_swift_1510000007","ph_swift_1510000008","ph_swift_1510000009","ph_swift_1510000010","ph_swift_1510000011","ph_swift_1510000012","ph_swift_1510000013","ph_swift_1510000014","ph_swift_1510000015","ph_swift_1510000016","ph_swift_1510000017","ph_swift_1510000018","ph_swift_1510000019","ph_swift_1510000020","ph_swift_1510000021","ph_swift_1510000023","ph_swift_1510000024","ph_swift_1510000025","ph_swift_210000001","ph_swift_210000002","ph_swift_210000003","ph_swift_210000004","ph_swift_210000005","ph_swift_210000006","ph_swift_210000007","ph_swift_210000008","ph_swift_210000009","ph_swift_210000010","ph_swift_510100001","ph_swift_510200001","ph_swift_510200002","ph_swift_510301001","ph_swift_510301002","ph_swift_510301003","ph_swift_510302001","ph_swift_510302002","ph_swift_510302003","ph_swift_510303000","ph_swift_510401000","ph_swift_510402001","ph_swift_510402002","ph_swift_510402003","ph_swift_510402004","ph_swift_510402005","ph_swift_510402006","ph_swift_510402007","ph_swift_510500001","ph_swift_510500002","ph_swift_510600001","ph_swift_510600002","ph_swift_510600003","ph_swift_510600004","ph_swift_510700000","ph_swift_510800001","ph_swift_510800002","ph_swift_510900000","ph_swift_511000001","ph_swift_511000002","ph_swift_511100001","ph_swift_511100002","ph_swift_511100003","ph_swift_511200000","ph_swift_511300001","ph_swift_511300002","ph_swift_511300003","ph_swift_511300004","ph_swift_511300005","ph_swift_511300006","ph_swift_511300007","ph_swift_511300008","ph_swift_511400001","ph_swift_511400002","ph_swift_511400003","ph_swift_511400004","ph_swift_511400005","ph_swift_511500001","ph_swift_511500002","ph_swift_511500003","ph_swift_511500004","ph_swift_511600001","ph_swift_511600002","ph_swift_511600003","ph_swift_511700001","ph_swift_511700002","ph_swift_511700003","ph_swift_610000001","ph_swift_610000002","ph_swift_610000003","ph_swift_610000004","ph_swift_610000005","ph_swift_610000006","ph_swift_610000007","ph_swift_710100001","ph_swift_710100002","ph_swift_710100003","ph_swift_710100004","ph_swift_710100006","ph_swift_710100007","ph_swift_710100008","ph_swift_710100009","ph_swift_710200001","ph_swift_710200002","ph_swift_710200003","ph_swift_710200004","ph_swift_710200009","ph_swift_710300001","ph_swift_710300002","ph_swift_710300003","ph_swift_710300004","ph_swift_710300009","ph_swift_710400001","ph_swift_710400002","ph_swift_810101001","ph_swift_810101002","ph_swift_810101003","ph_swift_810101004","ph_swift_810101007","ph_swift_810101008","ph_swift_810101011","ph_swift_810102001","ph_swift_810102002","ph_swift_810102003","ph_swift_810102004","ph_swift_810102005","ph_swift_810102006","ph_swift_810102007","ph_swift_810102008","ph_swift_810102009","ph_swift_810201001","ph_swift_810201002","ph_swift_810201003","ph_swift_810201004","ph_swift_810202001","ph_swift_810202002","ph_swift_810202003","ph_swift_810202005","ph_swift_810202006","ph_swift_910100001","ph_swift_910100002","ph_swift_910100003","ph_swift_910100004","ph_swift_910100005","ph_swift_910100006","ph_swift_910100007","ph_swift_910100009","ph_swift_910100010","ph_swift_910100011","ph_swift_910200001","ph_swift_910200002","ph_swift_910200003","ph_swift_910200004","ph_swift_910200005","ph_swift_910200006","ph_swift_910200007","ph_swift_910200009","ph_swift_910200010","ph_swift_910200011","pk_swift_9009","pk_swift_9010","pk_swift_9011","pk_swift_9012","pk_swift_9013","pk_swift_9014","pk_swift_9015","pk_swift_9016","pk_swift_9017","pk_swift_9018","pk_swift_9019","pk_swift_9020","pk_swift_9021","pk_swift_9022","pk_swift_9023","pk_swift_9024","pk_swift_9025","pk_swift_9026","pk_swift_9027","pk_swift_9028","pk_swift_9029","pk_swift_9030","pk_swift_9031","pk_swift_9032","pk_swift_9033","pk_swift_9041","pk_swift_9051","pk_swift_9052","pk_swift_9061","pk_swift_9071","pk_swift_9072","pk_swift_9073","pk_swift_9081","pk_swift_9082","pk_swift_9083","pk_swift_9084","pk_swift_9085","pk_swift_9086","pk_swift_9091","pk_swift_9092","pk_swift_9101","pk_swift_9102","pk_swift_9111","pk_swift_9121","pk_swift_9122","pk_swift_9124","pk_swift_9141","pk_swift_9146","pk_swift_9151","pk_swift_9152","pk_swift_9161","pk_swift_9171","pk_swift_9172","pk_swift_9173","pk_swift_9174","pk_swift_9181","pk_swift_9182","pk_swift_9183","pk_swift_9184","pk_swift_9185","pk_swift_9186","pk_swift_9191","pk_swift_9192","pk_swift_9193","pk_swift_9201","pk_swift_9202","pk_swift_9211","pk_swift_9212","pk_swift_9221","pk_swift_9222","pk_swift_9230","pk_swift_9231","pk_swift_9232","pk_swift_9233","pk_swift_9234","pk_swift_9235","pk_swift_9236","pk_swift_9237","pk_swift_9238","pk_swift_9239","pk_swift_9241","pk_swift_9242","pk_swift_9243","pk_swift_9244","pk_swift_9247","pk_swift_9248","pk_swift_9249","pk_swift_9250","pk_swift_9251","pk_swift_9261","pk_swift_9262","pk_swift_9271","pk_swift_9272","pk_swift_9273","pk_swift_9281","pk_swift_9291","pk_swift_9301","pk_swift_9302","pk_swift_9303","pk_swift_9311","pk_swift_9312","pk_swift_9322","pk_swift_9323","pk_swift_9324","pk_swift_9331","pk_swift_9332","pk_swift_9333","pk_swift_9341","pk_swift_9351","pk_swift_9361","pk_swift_9381","pk_swift_9391","pk_swift_9401","pk_swift_9412","pk_swift_9414","pk_swift_9421","pk_swift_9422","pk_swift_9423","pk_swift_9426","pk_swift_9431","pk_swift_9432","pk_swift_9433","pk_swift_9434","pk_swift_9435","pk_swift_9441","pk_swift_9442","pk_swift_9443","pk_swift_9444","pk_swift_9445","pk_swift_9448","pk_swift_9451","pk_swift_9452","pk_swift_9453","pk_swift_9454","pk_swift_9455","pk_swift_9456","pk_swift_9457","pk_swift_9458","pk_swift_9459","pk_swift_9461","pk_swift_9462","pk_swift_9463","pk_swift_9468","pk_swift_9469","pk_swift_9470","pk_swift_9471","pk_swift_9472","pk_swift_9473","pk_swift_9474","pk_swift_9475","pk_swift_9476","pk_swift_9477","pk_swift_9478","pk_swift_9479","pk_swift_9481","pk_swift_9482","pk_swift_9483","pk_swift_9484","pk_swift_9491","pk_swift_9492","pk_swift_9493","pk_swift_9494","pk_swift_9501","pk_swift_9502","pk_swift_9503","pk_swift_9521","pk_swift_9522","pk_swift_9523","pk_swift_9524","pk_swift_9525","pk_swift_9526","pk_swift_9527","pk_swift_9528","pk_swift_9529","pk_swift_9530","pk_swift_9531","pk_swift_9532","pk_swift_9533","pk_swift_9534","pk_swift_9535","pk_swift_9536","pk_swift_9537","pk_swift_9538","pk_swift_9539","pk_swift_9541","pk_swift_9542","pk_swift_9543","pk_swift_9544","pk_swift_9545","pk_swift_9546","pk_swift_9547","pk_swift_9548","pk_swift_9549","pk_swift_9551","pk_swift_9552","pk_swift_9553","pk_swift_9554","pk_swift_9555","pk_swift_9556","pk_swift_9561","pk_swift_9562","pk_swift_9563","pk_swift_9564","pk_swift_9565","pk_swift_9566","pk_swift_9572","pk_swift_9573","pk_swift_9574","pk_swift_9582","pk_swift_9583","pk_swift_9584","pk_swift_9592","pk_swift_9593","pk_swift_9594","pk_swift_9595","pk_swift_9596","pk_swift_9597","pk_swift_9602","pk_swift_9605","pk_swift_9606","pk_swift_9607","pk_swift_9608","pk_swift_9609","pk_swift_9612","pk_swift_9613","pk_swift_9614","pk_swift_9622","pk_swift_9623","pk_swift_9624","pk_swift_9625","pk_swift_9637","pk_swift_9638","pk_swift_9641","pk_swift_9642","pk_swift_9643","pk_swift_9644","pk_swift_9645","pk_swift_9646","pk_swift_9647","pk_swift_9648","pk_swift_9649","pk_swift_9650","pk_swift_9651","pk_swift_9652","pk_swift_9653","pk_swift_9654","pk_swift_9668","pk_swift_9669","pk_swift_9673","pk_swift_9674","pk_swift_9675","pk_swift_9676","pk_swift_9677","pk_swift_9678","pk_swift_9681","pk_swift_9682","pk_swift_9693","pk_swift_9694","pk_swift_9695","pk_swift_9697","pk_swift_9698","pk_swift_9699","pk_swift_9703","pk_swift_9707","pk_swift_9708","za_swift_105","za_swift_220","za_swift_231","za_swift_242","za_swift_250","za_swift_251","za_swift_265","za_swift_266","za_swift_275","za_swift_276","za_swift_280","za_swift_285","za_swift_287","za_swift_288","za_swift_289","za_swift_290","za_swift_291","za_swift_296","za_swift_297","za_swift_308","za_swift_401","za_swift_10101","za_swift_10301","za_swift_27201"]},"pix_key":{"type":["string","null"]},"force_cpf_cnpj":{"type":["boolean","null"],"description":"Force CPF/CNPJ validation for PIX key"},"beneficiary_name":{"type":["string","null"],"maxLength":128},"routing_number":{"type":["string","null"]},"account_number":{"type":["string","null"]},"account_type":{"type":["string","null"],"enum":["checking","saving"]},"account_class":{"type":["string","null"],"enum":["individual","business"]},"address_line_1":{"type":["string","null"]},"address_line_2":{"type":["string","null"]},"city":{"type":["string","null"]},"state_province_region":{"type":["string","null"]},"country":{"type":["string","null"],"enum":["AF","AL","DZ","AS","AD","AO","AI","AQ","AG","AR","AM","AW","AU","AT","AZ","BS","BH","BD","BB","BY","BE","BZ","BJ","BM","BT","BO","BQ","BA","BW","BV","BR","IO","BN","BG","BF","BI","CV","KH","CM","CA","KY","CF","TD","CL","CN","CX","CC","CO","KM","CD","CG","CK","CR","HR","CU","CW","CY","CZ","CI","DK","DJ","DM","DO","EC","EG","SV","GQ","ER","EE","SZ","ET","FK","FO","FJ","FI","FR","GF","PF","TF","GA","GM","GE","DE","GH","GI","GR","GL","GD","GP","GU","GT","GG","GN","GW","GY","HT","HM","VA","HN","HK","HU","IS","IN","ID","IR","IQ","IE","IM","IL","IT","JM","JP","JE","JO","KZ","KE","KI","KP","KR","KW","KG","LA","LV","LB","LS","LR","LY","LI","LT","LU","MO","MG","MW","MY","MV","ML","MT","MH","MQ","MR","MU","YT","MX","FM","MD","MC","MN","ME","MS","MA","MZ","MM","NA","NR","NP","NL","NC","NZ","NI","NE","NG","NU","NF","MP","NO","OM","PK","PW","PS","PA","PG","PY","PE","PH","PN","PL","PT","PR","QA","MK","RO","RU","RW","RE","BL","SH","KN","LC","MF","PM","VC","WS","SM","ST","SA","SN","RS","SC","SL","SG","SX","SK","SI","SB","SO","ZA","GS","SS","ES","LK","SD","SR","SJ","SE","CH","SY","TW","TJ","TZ","TH","TL","TG","TK","TO","TT","TN","TR","TM","TC","TV","UG","UA","AE","GB","UM","US","UY","UZ","VU","VE","VN","VG","VI","WF","EH","YE","ZM","ZW","AX"]},"postal_code":{"type":["string","null"]},"checkbook_account_id":{"type":["string","null"]},"checkbook_user_key":{"type":["string","null"]},"onemoney_external_account_id":{"type":["string","null"]},"pix_safe_bank_code":{"type":["string","null"],"pattern":"^\\d{4,8}$"},"pix_safe_branch_code":{"type":["string","null"],"pattern":"^\\d{4}(-\\d)?$"},"pix_safe_cpf_cnpj":{"type":["string","null"]},"ted_bank_code":{"type":["string","null"],"pattern":"^\\d{3,5}$"},"ted_branch_code":{"type":["string","null"],"pattern":"^\\d{4}(-\\d)?$"},"ted_cpf_cnpj":{"type":["string","null"]},"spei_protocol":{"type":["string","null"],"enum":["clabe","debitcard","phonenum"],"description":"For debitcard and phonenum the spei_institution_code is required"},"spei_institution_code":{"type":["string","null"],"minLength":5,"maxLength":5},"spei_clabe":{"type":["string","null"]},"transfers_type":{"type":["string","null"],"enum":["CVU","CBU","ALIAS"]},"transfers_account":{"type":["string","null"]},"ach_cop_beneficiary_first_name":{"type":["string","null"]},"ach_cop_beneficiary_last_name":{"type":["string","null"]},"ach_cop_document_id":{"type":["string","null"]},"ach_cop_document_type":{"type":["string","null"],"enum":["CC","CE","NIT","PASS","PEP"],"description":"CC - Cédula de Ciudadanía; CE - Cédula de Extranjería; NIT - Número de Identificación Tributaria; PASS - Passport; PEP - Permiso Especial de Permanencia"},"ach_cop_email":{"type":["string","null"]},"ach_cop_bank_code":{"type":["string","null"]},"ach_cop_bank_account":{"type":["string","null"]},"swift_code_bic":{"type":["string","null"]},"swift_account_holder_name":{"type":["string","null"],"maxLength":50},"swift_account_number_iban":{"type":["string","null"]},"swift_beneficiary_address_line_1":{"type":["string","null"]},"swift_beneficiary_address_line_2":{"type":["string","null"]},"swift_beneficiary_country":{"type":["string","null"],"enum":["AF","AL","DZ","AS","AD","AO","AI","AQ","AG","AR","AM","AW","AU","AT","AZ","BS","BH","BD","BB","BY","BE","BZ","BJ","BM","BT","BO","BQ","BA","BW","BV","BR","IO","BN","BG","BF","BI","CV","KH","CM","CA","KY","CF","TD","CL","CN","CX","CC","CO","KM","CD","CG","CK","CR","HR","CU","CW","CY","CZ","CI","DK","DJ","DM","DO","EC","EG","SV","GQ","ER","EE","SZ","ET","FK","FO","FJ","FI","FR","GF","PF","TF","GA","GM","GE","DE","GH","GI","GR","GL","GD","GP","GU","GT","GG","GN","GW","GY","HT","HM","VA","HN","HK","HU","IS","IN","ID","IR","IQ","IE","IM","IL","IT","JM","JP","JE","JO","KZ","KE","KI","KP","KR","KW","KG","LA","LV","LB","LS","LR","LY","LI","LT","LU","MO","MG","MW","MY","MV","ML","MT","MH","MQ","MR","MU","YT","MX","FM","MD","MC","MN","ME","MS","MA","MZ","MM","NA","NR","NP","NL","NC","NZ","NI","NE","NG","NU","NF","MP","NO","OM","PK","PW","PS","PA","PG","PY","PE","PH","PN","PL","PT","PR","QA","MK","RO","RU","RW","RE","BL","SH","KN","LC","MF","PM","VC","WS","SM","ST","SA","SN","RS","SC","SL","SG","SX","SK","SI","SB","SO","ZA","GS","SS","ES","LK","SD","SR","SJ","SE","CH","SY","TW","TJ","TZ","TH","TL","TG","TK","TO","TT","TN","TR","TM","TC","TV","UG","UA","AE","GB","UM","US","UY","UZ","VU","VE","VN","VG","VI","WF","EH","YE","ZM","ZW","AX"]},"swift_beneficiary_city":{"type":["string","null"]},"swift_beneficiary_state_province_region":{"type":["string","null"]},"swift_beneficiary_postal_code":{"type":["string","null"]},"swift_bank_name":{"type":["string","null"]},"swift_bank_address_line_1":{"type":["string","null"]},"swift_bank_address_line_2":{"type":["string","null"]},"swift_bank_country":{"type":["string","null"],"enum":["AF","AL","DZ","AS","AD","AO","AI","AQ","AG","AR","AM","AW","AU","AT","AZ","BS","BH","BD","BB","BY","BE","BZ","BJ","BM","BT","BO","BQ","BA","BW","BV","BR","IO","BN","BG","BF","BI","CV","KH","CM","CA","KY","CF","TD","CL","CN","CX","CC","CO","KM","CD","CG","CK","CR","HR","CU","CW","CY","CZ","CI","DK","DJ","DM","DO","EC","EG","SV","GQ","ER","EE","SZ","ET","FK","FO","FJ","FI","FR","GF","PF","TF","GA","GM","GE","DE","GH","GI","GR","GL","GD","GP","GU","GT","GG","GN","GW","GY","HT","HM","VA","HN","HK","HU","IS","IN","ID","IR","IQ","IE","IM","IL","IT","JM","JP","JE","JO","KZ","KE","KI","KP","KR","KW","KG","LA","LV","LB","LS","LR","LY","LI","LT","LU","MO","MG","MW","MY","MV","ML","MT","MH","MQ","MR","MU","YT","MX","FM","MD","MC","MN","ME","MS","MA","MZ","MM","NA","NR","NP","NL","NC","NZ","NI","NE","NG","NU","NF","MP","NO","OM","PK","PW","PS","PA","PG","PY","PE","PH","PN","PL","PT","PR","QA","MK","RO","RU","RW","RE","BL","SH","KN","LC","MF","PM","VC","WS","SM","ST","SA","SN","RS","SC","SL","SG","SX","SK","SI","SB","SO","ZA","GS","SS","ES","LK","SD","SR","SJ","SE","CH","SY","TW","TJ","TZ","TH","TL","TG","TK","TO","TT","TN","TR","TM","TC","TV","UG","UA","AE","GB","UM","US","UY","UZ","VU","VE","VN","VG","VI","WF","EH","YE","ZM","ZW","AX"]},"swift_bank_city":{"type":["string","null"]},"swift_bank_state_province_region":{"type":["string","null"]},"swift_bank_postal_code":{"type":["string","null"]},"swift_ifsc_branch_code":{"type":["string","null"],"pattern":"^[A-Z]{4}0[A-Z0-9]{6}$"},"swift_intermediary_bank_swift_code_bic":{"anyOf":[{"type":"string","minLength":8,"maxLength":8},{"type":"string","minLength":11,"maxLength":11},{"type":"null"}]},"swift_intermediary_bank_account_number_iban":{"type":["string","null"],"maxLength":34},"swift_intermediary_bank_name":{"type":["string","null"]},"swift_intermediary_bank_country":{"type":["string","null"],"enum":["AF","AL","DZ","AS","AD","AO","AI","AQ","AG","AR","AM","AW","AU","AT","AZ","BS","BH","BD","BB","BY","BE","BZ","BJ","BM","BT","BO","BQ","BA","BW","BV","BR","IO","BN","BG","BF","BI","CV","KH","CM","CA","KY","CF","TD","CL","CN","CX","CC","CO","KM","CD","CG","CK","CR","HR","CU","CW","CY","CZ","CI","DK","DJ","DM","DO","EC","EG","SV","GQ","ER","EE","SZ","ET","FK","FO","FJ","FI","FR","GF","PF","TF","GA","GM","GE","DE","GH","GI","GR","GL","GD","GP","GU","GT","GG","GN","GW","GY","HT","HM","VA","HN","HK","HU","IS","IN","ID","IR","IQ","IE","IM","IL","IT","JM","JP","JE","JO","KZ","KE","KI","KP","KR","KW","KG","LA","LV","LB","LS","LR","LY","LI","LT","LU","MO","MG","MW","MY","MV","ML","MT","MH","MQ","MR","MU","YT","MX","FM","MD","MC","MN","ME","MS","MA","MZ","MM","NA","NR","NP","NL","NC","NZ","NI","NE","NG","NU","NF","MP","NO","OM","PK","PW","PS","PA","PG","PY","PE","PH","PN","PL","PT","PR","QA","MK","RO","RU","RW","RE","BL","SH","KN","LC","MF","PM","VC","WS","SM","ST","SA","SN","RS","SC","SL","SG","SX","SK","SI","SB","SO","ZA","GS","SS","ES","LK","SD","SR","SJ","SE","CH","SY","TW","TJ","TZ","TH","TL","TG","TK","TO","TT","TN","TR","TM","TC","TV","UG","UA","AE","GB","UM","US","UY","UZ","VU","VE","VN","VG","VI","WF","EH","YE","ZM","ZW","AX"]},"sepa_iban":{"type":["string","null"]},"sepa_beneficiary_bic":{"type":["string","null"],"description":"BIC/SWIFT code of the beneficiary bank"},"sepa_beneficiary_legal_name":{"type":["string","null"],"maxLength":128},"sepa_beneficiary_address_line_1":{"type":["string","null"]},"sepa_beneficiary_address_line_2":{"type":["string","null"]},"sepa_beneficiary_city":{"type":["string","null"]},"sepa_beneficiary_state_province_region":{"type":["string","null"]},"sepa_beneficiary_postal_code":{"type":["string","null"]},"sepa_beneficiary_country":{"type":["string","null"],"enum":["AF","AL","DZ","AS","AD","AO","AI","AQ","AG","AR","AM","AW","AU","AT","AZ","BS","BH","BD","BB","BY","BE","BZ","BJ","BM","BT","BO","BQ","BA","BW","BV","BR","IO","BN","BG","BF","BI","CV","KH","CM","CA","KY","CF","TD","CL","CN","CX","CC","CO","KM","CD","CG","CK","CR","HR","CU","CW","CY","CZ","CI","DK","DJ","DM","DO","EC","EG","SV","GQ","ER","EE","SZ","ET","FK","FO","FJ","FI","FR","GF","PF","TF","GA","GM","GE","DE","GH","GI","GR","GL","GD","GP","GU","GT","GG","GN","GW","GY","HT","HM","VA","HN","HK","HU","IS","IN","ID","IR","IQ","IE","IM","IL","IT","JM","JP","JE","JO","KZ","KE","KI","KP","KR","KW","KG","LA","LV","LB","LS","LR","LY","LI","LT","LU","MO","MG","MW","MY","MV","ML","MT","MH","MQ","MR","MU","YT","MX","FM","MD","MC","MN","ME","MS","MA","MZ","MM","NA","NR","NP","NL","NC","NZ","NI","NE","NG","NU","NF","MP","NO","OM","PK","PW","PS","PA","PG","PY","PE","PH","PN","PL","PT","PR","QA","MK","RO","RU","RW","RE","BL","SH","KN","LC","MF","PM","VC","WS","SM","ST","SA","SN","RS","SC","SL","SG","SX","SK","SI","SB","SO","ZA","GS","SS","ES","LK","SD","SR","SJ","SE","CH","SY","TW","TJ","TZ","TH","TL","TG","TK","TO","TT","TN","TR","TM","TC","TV","UG","UA","AE","GB","UM","US","UY","UZ","VU","VE","VN","VG","VI","WF","EH","YE","ZM","ZW","AX"]},"business_industry":{"type":["string","null"],"enum":["111998","112120","113310","115114","541211","541810","541430","541715","541930","561422","561311","561612","561740","561730","236115","236220","237310","238210","811111","812111","812112","532111","624410","541922","811210","812199","611110","611310","611410","611710","211120","212114","221310","562111","562920","213112","522110","522210","522320","523150","523940","523999","524113","813110","813211","813219","551112","721110","722511","722513","561510","713110","713210","712110","711110","711211","621111","621210","622110","623110","621511","623220","541940","621399","621910","541110","311421","337121","322220","339920","334210","339930","312130","334111","334118","325412","339112","336110","336390","315990","313110","339910","516120","513130","512250","519130","711410","711510","531110","531120","531130","531190","531210","531311","531312","531320","531390","454110","445110","455110","457110","449210","444110","459210","459120","445320","458110","458210","458310","455219","424210","456110","446120","541511","541512","541519","518210","511210","517111","517112","517410","481111","483111","485210","488510","484121","493110","423430","423690","423110","423830","423840","423510","424690","424990","424410","424480","423940","541611","541618","541330","541990","541214","561499"]},"phone_number":{"type":["string","null"]},"tax_id":{"type":["string","null"],"maxLength":32},"date_of_birth":{"anyOf":[{"type":"string","format":"date-time"},{"type":"string"},{"type":"null"}]}},"required":["type","name"],"description":"Create a new bank account"}},"required":["receiver_id","instance_id"]},
    method: "post",
    pathTemplate: "/v1/instances/{instance_id}/receivers/{receiver_id}/bank-accounts",
    executionParameters: [{"name":"receiver_id","in":"path"},{"name":"instance_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1InstancesReceiversBankAccountsById", {
    name: "GetV1InstancesReceiversBankAccountsById",
    description: `Retrieve Bank Account`,
    inputSchema: {"type":"object","properties":{"receiver_id":{"type":"string","minLength":15,"maxLength":15},"instance_id":{"type":"string","minLength":15,"maxLength":15},"id":{"type":"string","minLength":15,"maxLength":15}},"required":["receiver_id","instance_id","id"]},
    method: "get",
    pathTemplate: "/v1/instances/{instance_id}/receivers/{receiver_id}/bank-accounts/{id}",
    executionParameters: [{"name":"receiver_id","in":"path"},{"name":"instance_id","in":"path"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["DeleteV1InstancesReceiversBankAccountsById", {
    name: "DeleteV1InstancesReceiversBankAccountsById",
    description: `Remove Bank Account`,
    inputSchema: {"type":"object","properties":{"receiver_id":{"type":"string","minLength":15,"maxLength":15},"instance_id":{"type":"string","minLength":15,"maxLength":15},"id":{"type":"string","minLength":15,"maxLength":15}},"required":["receiver_id","instance_id","id"]},
    method: "delete",
    pathTemplate: "/v1/instances/{instance_id}/receivers/{receiver_id}/bank-accounts/{id}",
    executionParameters: [{"name":"receiver_id","in":"path"},{"name":"instance_id","in":"path"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1AvailableBankDetails", {
    name: "GetV1AvailableBankDetails",
    description: `Bank Details`,
    inputSchema: {"type":"object","properties":{"rail":{"type":"string","enum":["wire","ach","pix","pix_safe","ted","spei_bitso","transfers_bitso","ach_cop_bitso","international_swift","rtp","sepa"]}},"required":["rail"]},
    method: "get",
    pathTemplate: "/v1/available/bank-details",
    executionParameters: [{"name":"rail","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: []
  }],
  ["GetV1AvailableRails", {
    name: "GetV1AvailableRails",
    description: `Rails`,
    inputSchema: {"type":"object","properties":{}},
    method: "get",
    pathTemplate: "/v1/available/rails",
    executionParameters: [],
    requestBodyContentType: undefined,
    securityRequirements: []
  }],
  ["GetV1AvailableNaics", {
    name: "GetV1AvailableNaics",
    description: `NAICS list`,
    inputSchema: {"type":"object","properties":{}},
    method: "get",
    pathTemplate: "/v1/available/naics",
    executionParameters: [],
    requestBodyContentType: undefined,
    securityRequirements: []
  }],
  ["GetV1AvailableSwiftBySwift", {
    name: "GetV1AvailableSwiftBySwift",
    description: `Swift code bank details`,
    inputSchema: {"type":"object","properties":{"swift":{"anyOf":[{"type":"string","minLength":8,"maxLength":8,"pattern":"^[A-Z0-9]+$"},{"type":"string","minLength":11,"maxLength":11,"pattern":"^[A-Z0-9]+$"}]}},"required":["swift"]},
    method: "get",
    pathTemplate: "/v1/available/swift/{swift}",
    executionParameters: [{"name":"swift","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1InstancesOnboardingBusinessDetails", {
    name: "GetV1InstancesOnboardingBusinessDetails",
    description: `Retrieve Business Details`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15}},"required":["instance_id"]},
    method: "get",
    pathTemplate: "/v1/instances/{instance_id}/onboarding/business_details",
    executionParameters: [{"name":"instance_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PutV1InstancesOnboardingBusinessDetails", {
    name: "PutV1InstancesOnboardingBusinessDetails",
    description: `Upsert Business Details`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"requestBody":{"type":"object","properties":{"entity_type":{"type":"string","enum":["cooperative","corporation","company","partnership","sole_proprietor","trust","other"]},"legal_name":{"type":"string"},"tax_id":{"type":"string"},"state_of_incorporation":{"type":"string"},"formation_date":{"anyOf":[{"type":"string","format":"date-time"},{"type":"string"}]},"trading_names":{"type":"array","items":{"type":"string"},"default":[]},"address_line_1":{"type":"string"},"address_line_2":{"type":["string","null"]},"city":{"type":"string"},"state_province_region":{"type":"string"},"postal_code":{"type":"string"},"country":{"type":"string","enum":["AF","AL","DZ","AS","AD","AO","AI","AQ","AG","AR","AM","AW","AU","AT","AZ","BS","BH","BD","BB","BY","BE","BZ","BJ","BM","BT","BO","BQ","BA","BW","BV","BR","IO","BN","BG","BF","BI","CV","KH","CM","CA","KY","CF","TD","CL","CN","CX","CC","CO","KM","CD","CG","CK","CR","HR","CU","CW","CY","CZ","CI","DK","DJ","DM","DO","EC","EG","SV","GQ","ER","EE","SZ","ET","FK","FO","FJ","FI","FR","GF","PF","TF","GA","GM","GE","DE","GH","GI","GR","GL","GD","GP","GU","GT","GG","GN","GW","GY","HT","HM","VA","HN","HK","HU","IS","IN","ID","IR","IQ","IE","IM","IL","IT","JM","JP","JE","JO","KZ","KE","KI","KP","KR","KW","KG","LA","LV","LB","LS","LR","LY","LI","LT","LU","MO","MG","MW","MY","MV","ML","MT","MH","MQ","MR","MU","YT","MX","FM","MD","MC","MN","ME","MS","MA","MZ","MM","NA","NR","NP","NL","NC","NZ","NI","NE","NG","NU","NF","MP","NO","OM","PK","PW","PS","PA","PG","PY","PE","PH","PN","PL","PT","PR","QA","MK","RO","RU","RW","RE","BL","SH","KN","LC","MF","PM","VC","WS","SM","ST","SA","SN","RS","SC","SL","SG","SX","SK","SI","SB","SO","ZA","GS","SS","ES","LK","SD","SR","SJ","SE","CH","SY","TW","TJ","TZ","TH","TL","TG","TK","TO","TT","TN","TR","TM","TC","TV","UG","UA","AE","GB","UM","US","UY","UZ","VU","VE","VN","VG","VI","WF","EH","YE","ZM","ZW","AX"]}},"required":["entity_type","legal_name","tax_id","state_of_incorporation","formation_date","address_line_1","city","state_province_region","postal_code","country"],"description":"Upsert business details"}},"required":["instance_id"]},
    method: "put",
    pathTemplate: "/v1/instances/{instance_id}/onboarding/business_details",
    executionParameters: [{"name":"instance_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1InstancesOnboardingBusinessProfile", {
    name: "GetV1InstancesOnboardingBusinessProfile",
    description: `Retrieve Business Profile`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15}},"required":["instance_id"]},
    method: "get",
    pathTemplate: "/v1/instances/{instance_id}/onboarding/business_profile",
    executionParameters: [{"name":"instance_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PutV1InstancesOnboardingBusinessProfile", {
    name: "PutV1InstancesOnboardingBusinessProfile",
    description: `Upsert Business Profile`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"requestBody":{"type":"object","properties":{"scenario":{"type":"string","enum":["custodial","custodial_mtl","non_custodial","other"]},"scenario_description":{"type":["string","null"]},"has_kyc_screening":{"type":["boolean","null"]},"is_regulated":{"type":["boolean","null"]},"business_industry":{"type":"string","enum":["wallet","exchange","dapp","neo_bank","gaming","marketplace","saas","social","infra","gambling","other"]},"website":{"type":["string","null"],"format":"uri"},"top_volume_by_country":{"type":"array","items":{"type":"string","enum":["AF","AL","DZ","AS","AD","AO","AI","AQ","AG","AR","AM","AW","AU","AT","AZ","BS","BH","BD","BB","BY","BE","BZ","BJ","BM","BT","BO","BQ","BA","BW","BV","BR","IO","BN","BG","BF","BI","CV","KH","CM","CA","KY","CF","TD","CL","CN","CX","CC","CO","KM","CD","CG","CK","CR","HR","CU","CW","CY","CZ","CI","DK","DJ","DM","DO","EC","EG","SV","GQ","ER","EE","SZ","ET","FK","FO","FJ","FI","FR","GF","PF","TF","GA","GM","GE","DE","GH","GI","GR","GL","GD","GP","GU","GT","GG","GN","GW","GY","HT","HM","VA","HN","HK","HU","IS","IN","ID","IR","IQ","IE","IM","IL","IT","JM","JP","JE","JO","KZ","KE","KI","KP","KR","KW","KG","LA","LV","LB","LS","LR","LY","LI","LT","LU","MO","MG","MW","MY","MV","ML","MT","MH","MQ","MR","MU","YT","MX","FM","MD","MC","MN","ME","MS","MA","MZ","MM","NA","NR","NP","NL","NC","NZ","NI","NE","NG","NU","NF","MP","NO","OM","PK","PW","PS","PA","PG","PY","PE","PH","PN","PL","PT","PR","QA","MK","RO","RU","RW","RE","BL","SH","KN","LC","MF","PM","VC","WS","SM","ST","SA","SN","RS","SC","SL","SG","SX","SK","SI","SB","SO","ZA","GS","SS","ES","LK","SD","SR","SJ","SE","CH","SY","TW","TJ","TZ","TH","TL","TG","TK","TO","TT","TN","TR","TM","TC","TV","UG","UA","AE","GB","UM","US","UY","UZ","VU","VE","VN","VG","VI","WF","EH","YE","ZM","ZW","AX"]},"minItems":1},"estimated_volume_per_month":{"type":"string","enum":["up_to_100","up_to_500","up_to_1000","up_to_10000","more_than_10000"]}},"required":["scenario","business_industry","top_volume_by_country","estimated_volume_per_month"],"description":"Upsert business profile"}},"required":["instance_id"]},
    method: "put",
    pathTemplate: "/v1/instances/{instance_id}/onboarding/business_profile",
    executionParameters: [{"name":"instance_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1InstancesOnboardingOwnershipDocuments", {
    name: "GetV1InstancesOnboardingOwnershipDocuments",
    description: `Retrieve Business Documents`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15}},"required":["instance_id"]},
    method: "get",
    pathTemplate: "/v1/instances/{instance_id}/onboarding/ownership_documents",
    executionParameters: [{"name":"instance_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PutV1InstancesOnboardingOwnershipDocuments", {
    name: "PutV1InstancesOnboardingOwnershipDocuments",
    description: `Upsert Business Documents`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"requestBody":{"type":"object","properties":{"incorporation_doc_file":{"type":["string","null"]},"proof_of_ownership_doc_file":{"type":["string","null"]},"proof_of_address_doc_type":{"type":"string","enum":["UTILITY_BILL","BANK_STATEMENT","RENTAL_AGREEMENT","TAX_DOCUMENT","GOVERNMENT_CORRESPONDENCE"]},"proof_of_address_doc_file":{"type":"string"},"owners":{"type":"array","items":{"type":"object","properties":{"id":{"type":"string","minLength":15,"maxLength":15},"instance_id":{"type":"string","minLength":15,"maxLength":15},"role":{"type":"string","enum":["beneficial_controlling","beneficial_owner","controlling_person"]},"first_name":{"type":"string","minLength":1},"last_name":{"type":"string","minLength":1},"date_of_birth":{"anyOf":[{"type":"string","format":"date-time"},{"type":"string"}]},"tax_id":{"type":"string"},"address_line_1":{"type":"string"},"address_line_2":{"type":["string","null"]},"city":{"type":"string"},"state_province_region":{"type":"string"},"country":{"type":"string","enum":["AF","AL","DZ","AS","AD","AO","AI","AQ","AG","AR","AM","AW","AU","AT","AZ","BS","BH","BD","BB","BY","BE","BZ","BJ","BM","BT","BO","BQ","BA","BW","BV","BR","IO","BN","BG","BF","BI","CV","KH","CM","CA","KY","CF","TD","CL","CN","CX","CC","CO","KM","CD","CG","CK","CR","HR","CU","CW","CY","CZ","CI","DK","DJ","DM","DO","EC","EG","SV","GQ","ER","EE","SZ","ET","FK","FO","FJ","FI","FR","GF","PF","TF","GA","GM","GE","DE","GH","GI","GR","GL","GD","GP","GU","GT","GG","GN","GW","GY","HT","HM","VA","HN","HK","HU","IS","IN","ID","IR","IQ","IE","IM","IL","IT","JM","JP","JE","JO","KZ","KE","KI","KP","KR","KW","KG","LA","LV","LB","LS","LR","LY","LI","LT","LU","MO","MG","MW","MY","MV","ML","MT","MH","MQ","MR","MU","YT","MX","FM","MD","MC","MN","ME","MS","MA","MZ","MM","NA","NR","NP","NL","NC","NZ","NI","NE","NG","NU","NF","MP","NO","OM","PK","PW","PS","PA","PG","PY","PE","PH","PN","PL","PT","PR","QA","MK","RO","RU","RW","RE","BL","SH","KN","LC","MF","PM","VC","WS","SM","ST","SA","SN","RS","SC","SL","SG","SX","SK","SI","SB","SO","ZA","GS","SS","ES","LK","SD","SR","SJ","SE","CH","SY","TW","TJ","TZ","TH","TL","TG","TK","TO","TT","TN","TR","TM","TC","TV","UG","UA","AE","GB","UM","US","UY","UZ","VU","VE","VN","VG","VI","WF","EH","YE","ZM","ZW","AX"]},"postal_code":{"type":"string"},"id_doc_country":{"type":"string","enum":["AF","AL","DZ","AS","AD","AO","AI","AQ","AG","AR","AM","AW","AU","AT","AZ","BS","BH","BD","BB","BY","BE","BZ","BJ","BM","BT","BO","BQ","BA","BW","BV","BR","IO","BN","BG","BF","BI","CV","KH","CM","CA","KY","CF","TD","CL","CN","CX","CC","CO","KM","CD","CG","CK","CR","HR","CU","CW","CY","CZ","CI","DK","DJ","DM","DO","EC","EG","SV","GQ","ER","EE","SZ","ET","FK","FO","FJ","FI","FR","GF","PF","TF","GA","GM","GE","DE","GH","GI","GR","GL","GD","GP","GU","GT","GG","GN","GW","GY","HT","HM","VA","HN","HK","HU","IS","IN","ID","IR","IQ","IE","IM","IL","IT","JM","JP","JE","JO","KZ","KE","KI","KP","KR","KW","KG","LA","LV","LB","LS","LR","LY","LI","LT","LU","MO","MG","MW","MY","MV","ML","MT","MH","MQ","MR","MU","YT","MX","FM","MD","MC","MN","ME","MS","MA","MZ","MM","NA","NR","NP","NL","NC","NZ","NI","NE","NG","NU","NF","MP","NO","OM","PK","PW","PS","PA","PG","PY","PE","PH","PN","PL","PT","PR","QA","MK","RO","RU","RW","RE","BL","SH","KN","LC","MF","PM","VC","WS","SM","ST","SA","SN","RS","SC","SL","SG","SX","SK","SI","SB","SO","ZA","GS","SS","ES","LK","SD","SR","SJ","SE","CH","SY","TW","TJ","TZ","TH","TL","TG","TK","TO","TT","TN","TR","TM","TC","TV","UG","UA","AE","GB","UM","US","UY","UZ","VU","VE","VN","VG","VI","WF","EH","YE","ZM","ZW","AX"]},"id_doc_type":{"type":"string","enum":["PASSPORT","ID_CARD","DRIVERS"]},"id_doc_front_file":{"type":["string","null"],"format":"uri"},"id_doc_back_file":{"type":["string","null"],"format":"uri"},"proof_of_address_doc_type":{"type":["string","null"],"enum":["UTILITY_BILL","BANK_STATEMENT","RENTAL_AGREEMENT","TAX_DOCUMENT","GOVERNMENT_CORRESPONDENCE"]},"proof_of_address_doc_file":{"type":["string","null"]}}}}},"required":["proof_of_address_doc_type","proof_of_address_doc_file","owners"],"description":"Upsert ownership documents"}},"required":["instance_id"]},
    method: "put",
    pathTemplate: "/v1/instances/{instance_id}/onboarding/ownership_documents",
    executionParameters: [{"name":"instance_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1InstancesOnboardingApplicant", {
    name: "GetV1InstancesOnboardingApplicant",
    description: `Retrieve Business Applicant`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15}},"required":["instance_id"]},
    method: "get",
    pathTemplate: "/v1/instances/{instance_id}/onboarding/applicant",
    executionParameters: [{"name":"instance_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PutV1InstancesOnboardingApplicant", {
    name: "PutV1InstancesOnboardingApplicant",
    description: `Upsert Business Applicant`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"requestBody":{"type":"object","properties":{"applicant_id":{"type":"string"},"applicant_authorized":{"type":["boolean","null"]},"legal_representative_doc_file":{"type":["string","null"]}},"required":["applicant_id"],"description":"Upsert applicant"}},"required":["instance_id"]},
    method: "put",
    pathTemplate: "/v1/instances/{instance_id}/onboarding/applicant",
    executionParameters: [{"name":"instance_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1InstancesOnboardingCompliance", {
    name: "GetV1InstancesOnboardingCompliance",
    description: `Retrieve Compliance Status`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15}},"required":["instance_id"]},
    method: "get",
    pathTemplate: "/v1/instances/{instance_id}/onboarding/compliance",
    executionParameters: [{"name":"instance_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1InstancesOnboardingAccessToken", {
    name: "GetV1InstancesOnboardingAccessToken",
    description: `Retrieve Access Token`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15}},"required":["instance_id"]},
    method: "get",
    pathTemplate: "/v1/instances/{instance_id}/onboarding/access_token",
    executionParameters: [{"name":"instance_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1InstancesOnboardingLiveness", {
    name: "PostV1InstancesOnboardingLiveness",
    description: `Executes POST /v1/instances/{instance_id}/onboarding/liveness`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"requestBody":{"type":"object","properties":{"liveness_session_id":{"type":"string"}},"required":["liveness_session_id"],"description":"Complete SumSub SDK"}},"required":["instance_id"]},
    method: "post",
    pathTemplate: "/v1/instances/{instance_id}/onboarding/liveness",
    executionParameters: [{"name":"instance_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1InstancesOnboardingComplete", {
    name: "PostV1InstancesOnboardingComplete",
    description: `Executes POST /v1/instances/{instance_id}/onboarding/complete`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15}},"required":["instance_id"]},
    method: "post",
    pathTemplate: "/v1/instances/{instance_id}/onboarding/complete",
    executionParameters: [{"name":"instance_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1EInstancesOnboardingInfo", {
    name: "GetV1EInstancesOnboardingInfo",
    description: `Retrieve External Onboarding Info`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"token":{"type":"string"}},"required":["instance_id","token"]},
    method: "get",
    pathTemplate: "/v1/e/instances/{instance_id}/onboarding/info",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"token","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1EInstancesOnboardingBusinessDetails", {
    name: "GetV1EInstancesOnboardingBusinessDetails",
    description: `Retrieve Business Details (External Invite)`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"token":{"type":"string"}},"required":["instance_id","token"]},
    method: "get",
    pathTemplate: "/v1/e/instances/{instance_id}/onboarding/business_details",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"token","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PutV1EInstancesOnboardingBusinessDetails", {
    name: "PutV1EInstancesOnboardingBusinessDetails",
    description: `Upsert Business Details (External Invite)`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"token":{"type":"string"},"requestBody":{"type":"object","properties":{"entity_type":{"type":"string","enum":["cooperative","corporation","company","partnership","sole_proprietor","trust","other"]},"legal_name":{"type":"string"},"tax_id":{"type":"string"},"state_of_incorporation":{"type":"string"},"formation_date":{"anyOf":[{"type":"string","format":"date-time"},{"type":"string"}]},"trading_names":{"type":"array","items":{"type":"string"},"default":[]},"address_line_1":{"type":"string"},"address_line_2":{"type":["string","null"]},"city":{"type":"string"},"state_province_region":{"type":"string"},"postal_code":{"type":"string"},"country":{"type":"string","enum":["AF","AL","DZ","AS","AD","AO","AI","AQ","AG","AR","AM","AW","AU","AT","AZ","BS","BH","BD","BB","BY","BE","BZ","BJ","BM","BT","BO","BQ","BA","BW","BV","BR","IO","BN","BG","BF","BI","CV","KH","CM","CA","KY","CF","TD","CL","CN","CX","CC","CO","KM","CD","CG","CK","CR","HR","CU","CW","CY","CZ","CI","DK","DJ","DM","DO","EC","EG","SV","GQ","ER","EE","SZ","ET","FK","FO","FJ","FI","FR","GF","PF","TF","GA","GM","GE","DE","GH","GI","GR","GL","GD","GP","GU","GT","GG","GN","GW","GY","HT","HM","VA","HN","HK","HU","IS","IN","ID","IR","IQ","IE","IM","IL","IT","JM","JP","JE","JO","KZ","KE","KI","KP","KR","KW","KG","LA","LV","LB","LS","LR","LY","LI","LT","LU","MO","MG","MW","MY","MV","ML","MT","MH","MQ","MR","MU","YT","MX","FM","MD","MC","MN","ME","MS","MA","MZ","MM","NA","NR","NP","NL","NC","NZ","NI","NE","NG","NU","NF","MP","NO","OM","PK","PW","PS","PA","PG","PY","PE","PH","PN","PL","PT","PR","QA","MK","RO","RU","RW","RE","BL","SH","KN","LC","MF","PM","VC","WS","SM","ST","SA","SN","RS","SC","SL","SG","SX","SK","SI","SB","SO","ZA","GS","SS","ES","LK","SD","SR","SJ","SE","CH","SY","TW","TJ","TZ","TH","TL","TG","TK","TO","TT","TN","TR","TM","TC","TV","UG","UA","AE","GB","UM","US","UY","UZ","VU","VE","VN","VG","VI","WF","EH","YE","ZM","ZW","AX"]}},"required":["entity_type","legal_name","tax_id","state_of_incorporation","formation_date","address_line_1","city","state_province_region","postal_code","country"],"description":"Upsert business details via external invite"}},"required":["instance_id","token"]},
    method: "put",
    pathTemplate: "/v1/e/instances/{instance_id}/onboarding/business_details",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"token","in":"query"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1EInstancesOnboardingBusinessProfile", {
    name: "GetV1EInstancesOnboardingBusinessProfile",
    description: `Retrieve Business Profile (External Invite)`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"token":{"type":"string"}},"required":["instance_id","token"]},
    method: "get",
    pathTemplate: "/v1/e/instances/{instance_id}/onboarding/business_profile",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"token","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PutV1EInstancesOnboardingBusinessProfile", {
    name: "PutV1EInstancesOnboardingBusinessProfile",
    description: `Upsert Business Profile (External Invite)`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"token":{"type":"string"},"requestBody":{"type":"object","properties":{"scenario":{"type":"string","enum":["custodial","custodial_mtl","non_custodial","other"]},"scenario_description":{"type":["string","null"]},"has_kyc_screening":{"type":["boolean","null"]},"is_regulated":{"type":["boolean","null"]},"business_industry":{"type":"string","enum":["wallet","exchange","dapp","neo_bank","gaming","marketplace","saas","social","infra","gambling","other"]},"website":{"type":["string","null"],"format":"uri"},"top_volume_by_country":{"type":"array","items":{"type":"string","enum":["AF","AL","DZ","AS","AD","AO","AI","AQ","AG","AR","AM","AW","AU","AT","AZ","BS","BH","BD","BB","BY","BE","BZ","BJ","BM","BT","BO","BQ","BA","BW","BV","BR","IO","BN","BG","BF","BI","CV","KH","CM","CA","KY","CF","TD","CL","CN","CX","CC","CO","KM","CD","CG","CK","CR","HR","CU","CW","CY","CZ","CI","DK","DJ","DM","DO","EC","EG","SV","GQ","ER","EE","SZ","ET","FK","FO","FJ","FI","FR","GF","PF","TF","GA","GM","GE","DE","GH","GI","GR","GL","GD","GP","GU","GT","GG","GN","GW","GY","HT","HM","VA","HN","HK","HU","IS","IN","ID","IR","IQ","IE","IM","IL","IT","JM","JP","JE","JO","KZ","KE","KI","KP","KR","KW","KG","LA","LV","LB","LS","LR","LY","LI","LT","LU","MO","MG","MW","MY","MV","ML","MT","MH","MQ","MR","MU","YT","MX","FM","MD","MC","MN","ME","MS","MA","MZ","MM","NA","NR","NP","NL","NC","NZ","NI","NE","NG","NU","NF","MP","NO","OM","PK","PW","PS","PA","PG","PY","PE","PH","PN","PL","PT","PR","QA","MK","RO","RU","RW","RE","BL","SH","KN","LC","MF","PM","VC","WS","SM","ST","SA","SN","RS","SC","SL","SG","SX","SK","SI","SB","SO","ZA","GS","SS","ES","LK","SD","SR","SJ","SE","CH","SY","TW","TJ","TZ","TH","TL","TG","TK","TO","TT","TN","TR","TM","TC","TV","UG","UA","AE","GB","UM","US","UY","UZ","VU","VE","VN","VG","VI","WF","EH","YE","ZM","ZW","AX"]},"minItems":1},"estimated_volume_per_month":{"type":"string","enum":["up_to_100","up_to_500","up_to_1000","up_to_10000","more_than_10000"]}},"required":["scenario","business_industry","top_volume_by_country","estimated_volume_per_month"],"description":"Upsert business profile via external invite"}},"required":["instance_id","token"]},
    method: "put",
    pathTemplate: "/v1/e/instances/{instance_id}/onboarding/business_profile",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"token","in":"query"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1EInstancesOnboardingOwnershipDocuments", {
    name: "GetV1EInstancesOnboardingOwnershipDocuments",
    description: `Retrieve Ownership Documents (External Invite)`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"token":{"type":"string"}},"required":["instance_id","token"]},
    method: "get",
    pathTemplate: "/v1/e/instances/{instance_id}/onboarding/ownership_documents",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"token","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PutV1EInstancesOnboardingOwnershipDocuments", {
    name: "PutV1EInstancesOnboardingOwnershipDocuments",
    description: `Upsert Ownership Documents (External Invite)`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"token":{"type":"string"},"requestBody":{"type":"object","properties":{"incorporation_doc_file":{"type":["string","null"]},"proof_of_ownership_doc_file":{"type":["string","null"]},"proof_of_address_doc_type":{"type":"string","enum":["UTILITY_BILL","BANK_STATEMENT","RENTAL_AGREEMENT","TAX_DOCUMENT","GOVERNMENT_CORRESPONDENCE"]},"proof_of_address_doc_file":{"type":"string"},"owners":{"type":"array","items":{"type":"object","properties":{"id":{"type":"string","minLength":15,"maxLength":15},"instance_id":{"type":"string","minLength":15,"maxLength":15},"role":{"type":"string","enum":["beneficial_controlling","beneficial_owner","controlling_person"]},"first_name":{"type":"string","minLength":1},"last_name":{"type":"string","minLength":1},"date_of_birth":{"anyOf":[{"type":"string","format":"date-time"},{"type":"string"}]},"tax_id":{"type":"string"},"address_line_1":{"type":"string"},"address_line_2":{"type":["string","null"]},"city":{"type":"string"},"state_province_region":{"type":"string"},"country":{"type":"string","enum":["AF","AL","DZ","AS","AD","AO","AI","AQ","AG","AR","AM","AW","AU","AT","AZ","BS","BH","BD","BB","BY","BE","BZ","BJ","BM","BT","BO","BQ","BA","BW","BV","BR","IO","BN","BG","BF","BI","CV","KH","CM","CA","KY","CF","TD","CL","CN","CX","CC","CO","KM","CD","CG","CK","CR","HR","CU","CW","CY","CZ","CI","DK","DJ","DM","DO","EC","EG","SV","GQ","ER","EE","SZ","ET","FK","FO","FJ","FI","FR","GF","PF","TF","GA","GM","GE","DE","GH","GI","GR","GL","GD","GP","GU","GT","GG","GN","GW","GY","HT","HM","VA","HN","HK","HU","IS","IN","ID","IR","IQ","IE","IM","IL","IT","JM","JP","JE","JO","KZ","KE","KI","KP","KR","KW","KG","LA","LV","LB","LS","LR","LY","LI","LT","LU","MO","MG","MW","MY","MV","ML","MT","MH","MQ","MR","MU","YT","MX","FM","MD","MC","MN","ME","MS","MA","MZ","MM","NA","NR","NP","NL","NC","NZ","NI","NE","NG","NU","NF","MP","NO","OM","PK","PW","PS","PA","PG","PY","PE","PH","PN","PL","PT","PR","QA","MK","RO","RU","RW","RE","BL","SH","KN","LC","MF","PM","VC","WS","SM","ST","SA","SN","RS","SC","SL","SG","SX","SK","SI","SB","SO","ZA","GS","SS","ES","LK","SD","SR","SJ","SE","CH","SY","TW","TJ","TZ","TH","TL","TG","TK","TO","TT","TN","TR","TM","TC","TV","UG","UA","AE","GB","UM","US","UY","UZ","VU","VE","VN","VG","VI","WF","EH","YE","ZM","ZW","AX"]},"postal_code":{"type":"string"},"id_doc_country":{"type":"string","enum":["AF","AL","DZ","AS","AD","AO","AI","AQ","AG","AR","AM","AW","AU","AT","AZ","BS","BH","BD","BB","BY","BE","BZ","BJ","BM","BT","BO","BQ","BA","BW","BV","BR","IO","BN","BG","BF","BI","CV","KH","CM","CA","KY","CF","TD","CL","CN","CX","CC","CO","KM","CD","CG","CK","CR","HR","CU","CW","CY","CZ","CI","DK","DJ","DM","DO","EC","EG","SV","GQ","ER","EE","SZ","ET","FK","FO","FJ","FI","FR","GF","PF","TF","GA","GM","GE","DE","GH","GI","GR","GL","GD","GP","GU","GT","GG","GN","GW","GY","HT","HM","VA","HN","HK","HU","IS","IN","ID","IR","IQ","IE","IM","IL","IT","JM","JP","JE","JO","KZ","KE","KI","KP","KR","KW","KG","LA","LV","LB","LS","LR","LY","LI","LT","LU","MO","MG","MW","MY","MV","ML","MT","MH","MQ","MR","MU","YT","MX","FM","MD","MC","MN","ME","MS","MA","MZ","MM","NA","NR","NP","NL","NC","NZ","NI","NE","NG","NU","NF","MP","NO","OM","PK","PW","PS","PA","PG","PY","PE","PH","PN","PL","PT","PR","QA","MK","RO","RU","RW","RE","BL","SH","KN","LC","MF","PM","VC","WS","SM","ST","SA","SN","RS","SC","SL","SG","SX","SK","SI","SB","SO","ZA","GS","SS","ES","LK","SD","SR","SJ","SE","CH","SY","TW","TJ","TZ","TH","TL","TG","TK","TO","TT","TN","TR","TM","TC","TV","UG","UA","AE","GB","UM","US","UY","UZ","VU","VE","VN","VG","VI","WF","EH","YE","ZM","ZW","AX"]},"id_doc_type":{"type":"string","enum":["PASSPORT","ID_CARD","DRIVERS"]},"id_doc_front_file":{"type":["string","null"],"format":"uri"},"id_doc_back_file":{"type":["string","null"],"format":"uri"},"proof_of_address_doc_type":{"type":["string","null"],"enum":["UTILITY_BILL","BANK_STATEMENT","RENTAL_AGREEMENT","TAX_DOCUMENT","GOVERNMENT_CORRESPONDENCE"]},"proof_of_address_doc_file":{"type":["string","null"]}}}}},"required":["proof_of_address_doc_type","proof_of_address_doc_file","owners"],"description":"Upsert ownership documents via external invite"}},"required":["instance_id","token"]},
    method: "put",
    pathTemplate: "/v1/e/instances/{instance_id}/onboarding/ownership_documents",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"token","in":"query"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1EInstancesOnboardingApplicant", {
    name: "GetV1EInstancesOnboardingApplicant",
    description: `Retrieve Applicant (External Invite)`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"token":{"type":"string"}},"required":["instance_id","token"]},
    method: "get",
    pathTemplate: "/v1/e/instances/{instance_id}/onboarding/applicant",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"token","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PutV1EInstancesOnboardingApplicant", {
    name: "PutV1EInstancesOnboardingApplicant",
    description: `Upsert Applicant (External Invite)`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"token":{"type":"string"},"requestBody":{"type":"object","properties":{"applicant_id":{"type":"string"},"applicant_authorized":{"type":["boolean","null"]},"legal_representative_doc_file":{"type":["string","null"]}},"required":["applicant_id"],"description":"Upsert applicant via external invite"}},"required":["instance_id","token"]},
    method: "put",
    pathTemplate: "/v1/e/instances/{instance_id}/onboarding/applicant",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"token","in":"query"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1EInstancesOnboardingCompliance", {
    name: "GetV1EInstancesOnboardingCompliance",
    description: `Retrieve Compliance Status (External Invite)`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"token":{"type":"string"}},"required":["instance_id","token"]},
    method: "get",
    pathTemplate: "/v1/e/instances/{instance_id}/onboarding/compliance",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"token","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1EInstancesOnboardingAccessToken", {
    name: "GetV1EInstancesOnboardingAccessToken",
    description: `Retrieve Access Token (External Invite)`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"token":{"type":"string"}},"required":["instance_id","token"]},
    method: "get",
    pathTemplate: "/v1/e/instances/{instance_id}/onboarding/access_token",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"token","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1EInstancesOnboardingLiveness", {
    name: "PostV1EInstancesOnboardingLiveness",
    description: `Complete Liveness (External Invite)`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"token":{"type":"string"},"requestBody":{"type":"object","properties":{"liveness_session_id":{"type":"string"}},"required":["liveness_session_id"],"description":"Complete liveness via external invite"}},"required":["instance_id","token"]},
    method: "post",
    pathTemplate: "/v1/e/instances/{instance_id}/onboarding/liveness",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"token","in":"query"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1EInstancesOnboardingComplete", {
    name: "PostV1EInstancesOnboardingComplete",
    description: `Complete Onboarding (External Invite)`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"token":{"type":"string"}},"required":["instance_id","token"]},
    method: "post",
    pathTemplate: "/v1/e/instances/{instance_id}/onboarding/complete",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"token","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1Instances", {
    name: "GetV1Instances",
    description: `Retrieve Instances`,
    inputSchema: {"type":"object","properties":{}},
    method: "get",
    pathTemplate: "/v1/instances",
    executionParameters: [],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1Instances", {
    name: "PostV1Instances",
    description: `Add Instance`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"name":{"type":"string","minLength":3,"maxLength":100},"type":{"type":"string","enum":["production","development"]}},"required":["name","type"],"description":"Create a new instance"}}},
    method: "post",
    pathTemplate: "/v1/instances",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1EInstancesById", {
    name: "GetV1EInstancesById",
    description: `Retrieve Instance Externally`,
    inputSchema: {"type":"object","properties":{"id":{"type":"string","minLength":15,"maxLength":15}},"required":["id"]},
    method: "get",
    pathTemplate: "/v1/e/instances/{id}",
    executionParameters: [{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PutV1InstancesById", {
    name: "PutV1InstancesById",
    description: `Update Instance`,
    inputSchema: {"type":"object","properties":{"id":{"type":"string","minLength":15,"maxLength":15},"requestBody":{"type":"object","properties":{"name":{"type":"string","minLength":3,"maxLength":100},"receiver_invite_redirect_url":{"type":["string","null"],"format":"uri"},"email_notifications":{"type":"boolean","default":true,"description":"Whether email notifications are enabled for this instance"},"require_passkey":{"type":"boolean","default":false,"description":"Whether passkey verification is required for protected actions"}},"required":["name"],"description":"Update instance"}},"required":["id"]},
    method: "put",
    pathTemplate: "/v1/instances/{id}",
    executionParameters: [{"name":"id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["DeleteV1InstancesById", {
    name: "DeleteV1InstancesById",
    description: `Delete Instance`,
    inputSchema: {"type":"object","properties":{"id":{"type":"string","minLength":15,"maxLength":15}},"required":["id"]},
    method: "delete",
    pathTemplate: "/v1/instances/{id}",
    executionParameters: [{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1InstancesMembers", {
    name: "GetV1InstancesMembers",
    description: `Retrieve Instance Members`,
    inputSchema: {"type":"object","properties":{"id":{"type":"string","minLength":15,"maxLength":15}},"required":["id"]},
    method: "get",
    pathTemplate: "/v1/instances/{id}/members",
    executionParameters: [{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PutV1InstancesMembersByUserId", {
    name: "PutV1InstancesMembersByUserId",
    description: `Update Instance Member Role`,
    inputSchema: {"type":"object","properties":{"id":{"type":"string"},"user_id":{"type":"string"},"requestBody":{"type":"object","properties":{"user_role":{"type":"string","enum":["owner","admin","finance","checker","operations","developer","viewer"]}},"required":["user_role"],"description":"Update instance member role"}},"required":["id","user_id"]},
    method: "put",
    pathTemplate: "/v1/instances/{id}/members/{user_id}",
    executionParameters: [{"name":"id","in":"path"},{"name":"user_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["DeleteV1InstancesMembersByUserId", {
    name: "DeleteV1InstancesMembersByUserId",
    description: `Delete Member from Instance`,
    inputSchema: {"type":"object","properties":{"id":{"type":"string"},"user_id":{"type":"string"}},"required":["id","user_id"]},
    method: "delete",
    pathTemplate: "/v1/instances/{id}/members/{user_id}",
    executionParameters: [{"name":"id","in":"path"},{"name":"user_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1InstancesMembersCopy", {
    name: "PostV1InstancesMembersCopy",
    description: `Copy Members from Another Instance`,
    inputSchema: {"type":"object","properties":{"id":{"type":"string","minLength":15,"maxLength":15},"requestBody":{"type":"object","properties":{"source_instance_id":{"type":"string","minLength":15,"maxLength":15}},"required":["source_instance_id"],"description":"Copy members and pending invites from another instance"}},"required":["id"]},
    method: "post",
    pathTemplate: "/v1/instances/{id}/members/copy",
    executionParameters: [{"name":"id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1InstancesOwnership", {
    name: "PostV1InstancesOwnership",
    description: `Migrate Instance Ownership`,
    inputSchema: {"type":"object","properties":{"id":{"type":"string","minLength":15,"maxLength":15},"requestBody":{"type":"object","properties":{"user_id":{"type":"string","minLength":15,"maxLength":15}},"required":["user_id"],"description":"Transfer instance ownership to another current member"}},"required":["id"]},
    method: "post",
    pathTemplate: "/v1/instances/{id}/ownership",
    executionParameters: [{"name":"id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1Playground", {
    name: "PostV1Playground",
    description: `Executes POST /v1/playground`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"magicValue":{"type":"string","enum":["failed","expired","delayed","asyncRfi"],"description":"CPN magic value for testing. See: https://developers.circle.com/cpn/references/magic-values"}},"description":"The JSON request body."}}},
    method: "post",
    pathTemplate: "/v1/playground",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1InstancesExternalReceiverToken", {
    name: "PostV1InstancesExternalReceiverToken",
    description: `Executes POST /v1/instances/{instance_id}/external-receiver-token`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"requestBody":{"type":"object","properties":{"type":{"type":"string","enum":["individual","business"]},"kyc_type":{"type":"string","enum":["light","standard","enhanced"]}},"required":["type","kyc_type"],"description":"Retrieve token"}},"required":["instance_id"]},
    method: "post",
    pathTemplate: "/v1/instances/{instance_id}/external-receiver-token",
    executionParameters: [{"name":"instance_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1InstancesOnboardingInvite", {
    name: "PostV1InstancesOnboardingInvite",
    description: `Invite External Onboarding Collaborator`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"requestBody":{"type":"object","properties":{"email":{"type":"string","format":"email","description":"Email address of the person who will receive the onboarding invite"}},"required":["email"],"description":"Email an external collaborator a JWT link to complete the instance onboarding"}},"required":["instance_id"]},
    method: "post",
    pathTemplate: "/v1/instances/{instance_id}/onboarding-invite",
    executionParameters: [{"name":"instance_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1UtilCheckArriveCrypto", {
    name: "PostV1UtilCheckArriveCrypto",
    description: `Executes POST /v1/util/check-arrive-crypto`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"payoutId":{"type":"string"},"txHash":{"type":"string"}},"required":["payoutId","txHash"],"description":"Check arrive crypto"}}},
    method: "post",
    pathTemplate: "/v1/util/check-arrive-crypto",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1UtilCheckArrivePix", {
    name: "PostV1UtilCheckArrivePix",
    description: `Executes POST /v1/util/check-arrive-pix`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"id":{"type":"string"},"sender_name":{"type":["string","null"],"description":"Force sender name for tracking_transaction (optional)"},"sender_tax_id":{"type":["string","null"],"description":"Force sender tax ID for tracking_transaction (optional)"},"sender_bank_code":{"type":["string","null"],"description":"Force sender bank code for tracking_transaction (optional)"},"sender_account_number":{"type":["string","null"],"description":"Force sender account number for tracking_transaction (optional)"}},"required":["id"],"description":"Check arrive pix"}}},
    method: "post",
    pathTemplate: "/v1/util/check-arrive-pix",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PutV1UtilPayoutTrackingComplete", {
    name: "PutV1UtilPayoutTrackingComplete",
    description: `Executes PUT /v1/util/payout/tracking_complete`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"payoutId":{"type":"string"},"txHash":{"type":"string"}},"required":["payoutId","txHash"],"description":"Check arrive crypto"}}},
    method: "put",
    pathTemplate: "/v1/util/payout/tracking_complete",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1UtilRestartReceiveCrypto", {
    name: "PostV1UtilRestartReceiveCrypto",
    description: `Executes POST /v1/util/restart-receive-crypto`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"payoutId":{"type":"string"}},"required":["payoutId"],"description":"Restart receive crypto"}}},
    method: "post",
    pathTemplate: "/v1/util/restart-receive-crypto",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1UtilVersion", {
    name: "GetV1UtilVersion",
    description: `Executes GET /v1/util/version`,
    inputSchema: {"type":"object","properties":{}},
    method: "get",
    pathTemplate: "/v1/util/version",
    executionParameters: [],
    requestBodyContentType: undefined,
    securityRequirements: []
  }],
  ["GetV1UtilParfinQuote", {
    name: "GetV1UtilParfinQuote",
    description: `Executes GET /v1/util/parfin/quote`,
    inputSchema: {"type":"object","properties":{}},
    method: "get",
    pathTemplate: "/v1/util/parfin/quote",
    executionParameters: [],
    requestBodyContentType: undefined,
    securityRequirements: []
  }],
  ["GetV1InstancesApiKeys", {
    name: "GetV1InstancesApiKeys",
    description: `Retrieve Api Keys`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15}},"required":["instance_id"]},
    method: "get",
    pathTemplate: "/v1/instances/{instance_id}/api-keys",
    executionParameters: [{"name":"instance_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1InstancesApiKeys", {
    name: "PostV1InstancesApiKeys",
    description: `Create Api Key`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"requestBody":{"type":"object","properties":{"name":{"type":"string","minLength":1},"permission":{"type":"string","enum":["full_access"]},"ip_whitelist":{"type":["array","null"],"items":{"type":"string","format":"ip"}}},"required":["name","permission"],"description":"Create a new api key"}},"required":["instance_id"]},
    method: "post",
    pathTemplate: "/v1/instances/{instance_id}/api-keys",
    executionParameters: [{"name":"instance_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1InstancesApiKeysById", {
    name: "GetV1InstancesApiKeysById",
    description: `Retrieve Api Key`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"id":{"type":"string","minLength":15,"maxLength":15}},"required":["instance_id","id"]},
    method: "get",
    pathTemplate: "/v1/instances/{instance_id}/api-keys/{id}",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["DeleteV1InstancesApiKeysById", {
    name: "DeleteV1InstancesApiKeysById",
    description: `Delete Api Key`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"id":{"type":"string","minLength":15,"maxLength":15}},"required":["instance_id","id"]},
    method: "delete",
    pathTemplate: "/v1/instances/{instance_id}/api-keys/{id}",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1InstancesAuditLogs", {
    name: "GetV1InstancesAuditLogs",
    description: `List audit logs`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string"},"limit":{"type":"string","enum":["10","50","100","200","500","1000"],"description":"Number of items to return"},"offset":{"type":"string","enum":["0","10","50","100","200","500","1000"],"description":"Number of items to skip"},"starting_after":{"type":"string","description":"A cursor for use in pagination. starting_after is an object ID that defines your place in the list."},"ending_before":{"type":"string","description":"A cursor for use in pagination. ending_before is an object ID that defines your place in the list."},"feature":{"type":"string"},"operation":{"type":"string","enum":["create","update","delete"]},"actor_type":{"type":"string","enum":["user","api_key"]},"user_id":{"type":"string"},"api_key_id":{"type":"string"},"entity_type":{"type":"string"},"entity_id":{"type":"string"},"start_date":{"type":"string","format":"date-time"},"end_date":{"type":"string","format":"date-time"}},"required":["instance_id"]},
    method: "get",
    pathTemplate: "/v1/instances/{instance_id}/audit-logs",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"limit","in":"query"},{"name":"offset","in":"query"},{"name":"starting_after","in":"query"},{"name":"ending_before","in":"query"},{"name":"feature","in":"query"},{"name":"operation","in":"query"},{"name":"actor_type","in":"query"},{"name":"user_id","in":"query"},{"name":"api_key_id","in":"query"},{"name":"entity_type","in":"query"},{"name":"entity_id","in":"query"},{"name":"start_date","in":"query"},{"name":"end_date","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1InstancesAuditLogsById", {
    name: "GetV1InstancesAuditLogsById",
    description: `Retrieve Audit Log`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string"},"id":{"type":"string"}},"required":["instance_id","id"]},
    method: "get",
    pathTemplate: "/v1/instances/{instance_id}/audit-logs/{id}",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1InstancesWebhookEndpoints", {
    name: "GetV1InstancesWebhookEndpoints",
    description: `Retrieve Webhooks`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15}},"required":["instance_id"]},
    method: "get",
    pathTemplate: "/v1/instances/{instance_id}/webhook-endpoints",
    executionParameters: [{"name":"instance_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1InstancesWebhookEndpoints", {
    name: "PostV1InstancesWebhookEndpoints",
    description: `Register Webhook`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"requestBody":{"type":"object","properties":{"url":{"type":"string","format":"uri"},"events":{"type":"array","items":{"type":"string","enum":["receiver.new","receiver.update","receiver.delete","customer.new","customer.update","customer.delete","bankAccount.new","payout.new","payout.update","payout.complete","payout.partnerFee","blockchainWallet.new","payin.new","payin.update","payin.complete","payin.partnerFee","tos.accept","limitIncrease.new","limitIncrease.update","virtualAccount.new","virtualAccount.complete","transfer.new","transfer.update","transfer.complete","wallet.new","wallet.inbound"]}}},"required":["url","events"],"description":"Create a new webhook endpoint"}},"required":["instance_id"]},
    method: "post",
    pathTemplate: "/v1/instances/{instance_id}/webhook-endpoints",
    executionParameters: [{"name":"instance_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["DeleteV1InstancesWebhookEndpointsById", {
    name: "DeleteV1InstancesWebhookEndpointsById",
    description: `Remove Webhook`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"id":{"type":"string","minLength":15,"maxLength":15}},"required":["instance_id","id"]},
    method: "delete",
    pathTemplate: "/v1/instances/{instance_id}/webhook-endpoints/{id}",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1InstancesWebhookEndpointsSecret", {
    name: "GetV1InstancesWebhookEndpointsSecret",
    description: `Retrieve Webhook Secret`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"id":{"type":"string","minLength":15,"maxLength":15}},"required":["instance_id","id"]},
    method: "get",
    pathTemplate: "/v1/instances/{instance_id}/webhook-endpoints/{id}/secret",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1InstancesWebhookEndpointsPortalAccess", {
    name: "GetV1InstancesWebhookEndpointsPortalAccess",
    description: `Retrieve Webhook Portal Access`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15}},"required":["instance_id"]},
    method: "get",
    pathTemplate: "/v1/instances/{instance_id}/webhook-endpoints/portal-access",
    executionParameters: [{"name":"instance_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1InstancesReceiversBlockchainWalletsSignMessage", {
    name: "GetV1InstancesReceiversBlockchainWalletsSignMessage",
    description: `Retrieve Blockchain Wallet Message`,
    inputSchema: {"type":"object","properties":{"receiver_id":{"type":"string","minLength":15,"maxLength":15},"instance_id":{"type":"string","minLength":15,"maxLength":15}},"required":["receiver_id","instance_id"]},
    method: "get",
    pathTemplate: "/v1/instances/{instance_id}/receivers/{receiver_id}/blockchain-wallets/sign-message",
    executionParameters: [{"name":"receiver_id","in":"path"},{"name":"instance_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1InstancesReceiversBlockchainWallets", {
    name: "GetV1InstancesReceiversBlockchainWallets",
    description: `Retrieve Blockchain Wallets`,
    inputSchema: {"type":"object","properties":{"receiver_id":{"type":"string","minLength":15,"maxLength":15},"instance_id":{"type":"string","minLength":15,"maxLength":15}},"required":["receiver_id","instance_id"]},
    method: "get",
    pathTemplate: "/v1/instances/{instance_id}/receivers/{receiver_id}/blockchain-wallets",
    executionParameters: [{"name":"receiver_id","in":"path"},{"name":"instance_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1InstancesReceiversBlockchainWallets", {
    name: "PostV1InstancesReceiversBlockchainWallets",
    description: `Add Blockchain Wallet`,
    inputSchema: {"type":"object","properties":{"receiver_id":{"type":"string","minLength":15,"maxLength":15},"instance_id":{"type":"string","minLength":15,"maxLength":15},"requestBody":{"type":"object","properties":{"name":{"type":"string"},"network":{"type":"string","enum":["base","sepolia","arbitrum_sepolia","base_sepolia","arbitrum","polygon","polygon_amoy","ethereum","stellar","stellar_testnet","tron","solana","solana_devnet"]},"signature_tx_hash":{"type":["string","null"]},"address":{"type":["string","null"]},"is_account_abstraction":{"type":["boolean","null"]}},"required":["name","network"],"description":"Create a new blockchain wallet"}},"required":["receiver_id","instance_id"]},
    method: "post",
    pathTemplate: "/v1/instances/{instance_id}/receivers/{receiver_id}/blockchain-wallets",
    executionParameters: [{"name":"receiver_id","in":"path"},{"name":"instance_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1InstancesReceiversBlockchainWalletsById", {
    name: "GetV1InstancesReceiversBlockchainWalletsById",
    description: `Retrieve Blockchain Wallet`,
    inputSchema: {"type":"object","properties":{"receiver_id":{"type":"string","minLength":15,"maxLength":15},"instance_id":{"type":"string","minLength":15,"maxLength":15},"id":{"type":"string","minLength":15,"maxLength":15}},"required":["receiver_id","instance_id","id"]},
    method: "get",
    pathTemplate: "/v1/instances/{instance_id}/receivers/{receiver_id}/blockchain-wallets/{id}",
    executionParameters: [{"name":"receiver_id","in":"path"},{"name":"instance_id","in":"path"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["DeleteV1InstancesReceiversBlockchainWalletsById", {
    name: "DeleteV1InstancesReceiversBlockchainWalletsById",
    description: `Remove Blockchain Wallet`,
    inputSchema: {"type":"object","properties":{"receiver_id":{"type":"string","minLength":15,"maxLength":15},"instance_id":{"type":"string","minLength":15,"maxLength":15},"id":{"type":"string","minLength":15,"maxLength":15}},"required":["receiver_id","instance_id","id"]},
    method: "delete",
    pathTemplate: "/v1/instances/{instance_id}/receivers/{receiver_id}/blockchain-wallets/{id}",
    executionParameters: [{"name":"receiver_id","in":"path"},{"name":"instance_id","in":"path"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1InstancesCreateAssetTrustline", {
    name: "PostV1InstancesCreateAssetTrustline",
    description: `Create Asset Trustline`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"requestBody":{"type":"object","properties":{"address":{"type":"string"}},"required":["address"],"description":"The JSON request body."}},"required":["instance_id"]},
    method: "post",
    pathTemplate: "/v1/instances/{instance_id}/create-asset-trustline",
    executionParameters: [{"name":"instance_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1InstancesMintUsdbStellar", {
    name: "PostV1InstancesMintUsdbStellar",
    description: `Mint USDB on Stellar`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"requestBody":{"type":"object","properties":{"address":{"type":"string"},"amount":{"type":"string"},"signedXdr":{"type":"string"}},"required":["address","amount"],"description":"The JSON request body."}},"required":["instance_id"]},
    method: "post",
    pathTemplate: "/v1/instances/{instance_id}/mint-usdb-stellar",
    executionParameters: [{"name":"instance_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1InstancesMintUsdbSolana", {
    name: "PostV1InstancesMintUsdbSolana",
    description: `Mint USDB on Solana`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"requestBody":{"type":"object","properties":{"address":{"type":"string"},"amount":{"type":"string"}},"required":["address","amount"],"description":"The JSON request body."}},"required":["instance_id"]},
    method: "post",
    pathTemplate: "/v1/instances/{instance_id}/mint-usdb-solana",
    executionParameters: [{"name":"instance_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1InstancesPrepareDelegateSolana", {
    name: "PostV1InstancesPrepareDelegateSolana",
    description: `Prepares a delegation transaction for Solana token transfers. You can either provide a \`quote_id\` (recommended) to automatically use the correct token amount and address from the quote, or manually provide \`owner_address\`, \`token_address\`, and \`amount\`.`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"requestBody":{"type":"object","properties":{"owner_address":{"type":"string","description":"The Solana wallet address that owns the tokens"},"quote_id":{"type":"string","minLength":15,"maxLength":15,"description":"The quote ID. When provided, the API will automatically use the sender_amount and token_address from the quote. This is the recommended approach."},"token_address":{"type":"string","description":"The SPL token mint address. Required if quote_id is not provided."},"amount":{"type":"string","description":"The token amount to delegate in USDC/USDT units (e.g., \"10.5\" for 10.5 USDC). Required if quote_id is not provided. Note: This should be the TOKEN amount, not the local currency amount."}},"required":["owner_address"],"description":"The JSON request body."}},"required":["instance_id"]},
    method: "post",
    pathTemplate: "/v1/instances/{instance_id}/prepare-delegate-solana",
    executionParameters: [{"name":"instance_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1InstancesPayinsById", {
    name: "GetV1InstancesPayinsById",
    description: `Retrieve Payin`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"id":{"type":"string","minLength":15,"maxLength":15}},"required":["instance_id","id"]},
    method: "get",
    pathTemplate: "/v1/instances/{instance_id}/payins/{id}",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1EPayinsById", {
    name: "GetV1EPayinsById",
    description: `Retrieve Payin Track`,
    inputSchema: {"type":"object","properties":{"id":{"type":"string","minLength":15,"maxLength":15}},"required":["id"]},
    method: "get",
    pathTemplate: "/v1/e/payins/{id}",
    executionParameters: [{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1InstancesPayins", {
    name: "GetV1InstancesPayins",
    description: `Retrieve Payins`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"limit":{"type":"string","enum":["10","50","100","200","500","1000"],"description":"Number of items to return"},"offset":{"type":"string","enum":["0","10","50","100","200","500","1000"],"description":"Number of items to skip"},"starting_after":{"type":"string","description":"A cursor for use in pagination. starting_after is an object ID that defines your place in the list."},"ending_before":{"type":"string","description":"A cursor for use in pagination. ending_before is an object ID that defines your place in the list."},"receiver_id":{"type":"string","minLength":15,"maxLength":15},"customer_id":{"type":"string","minLength":15,"maxLength":15},"status":{"type":"string","enum":["processing","on_hold","failed","refunded","completed"]},"receiver_name":{"type":"string"},"bank_account_id":{"type":"string"},"country":{"type":"string"},"payment_method":{"type":"string","enum":["ach","wire","pix","ted","spei","transfers","pse","international_swift","rtp"]},"network":{"type":"string"},"token":{"type":"string"}},"required":["instance_id"]},
    method: "get",
    pathTemplate: "/v1/instances/{instance_id}/payins",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"limit","in":"query"},{"name":"offset","in":"query"},{"name":"starting_after","in":"query"},{"name":"ending_before","in":"query"},{"name":"receiver_id","in":"query"},{"name":"customer_id","in":"query"},{"name":"status","in":"query"},{"name":"receiver_name","in":"query"},{"name":"bank_account_id","in":"query"},{"name":"country","in":"query"},{"name":"payment_method","in":"query"},{"name":"network","in":"query"},{"name":"token","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1InstancesPayinsExport", {
    name: "PostV1InstancesPayinsExport",
    description: `Queues an async job that emails the requesting user a CSV of all payins in the given date range.`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"requestBody":{"type":"object","properties":{"start_date":{"type":"string","format":"date-time","description":"Start of the date range (inclusive), ISO 8601."},"end_date":{"type":"string","format":"date-time","description":"End of the date range (inclusive), ISO 8601."}},"required":["start_date","end_date"],"description":"Date range to export"}},"required":["instance_id"]},
    method: "post",
    pathTemplate: "/v1/instances/{instance_id}/payins/export",
    executionParameters: [{"name":"instance_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1InstancesPayinsEvm", {
    name: "PostV1InstancesPayinsEvm",
    description: `Create Payin`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"requestBody":{"type":"object","properties":{"payin_quote_id":{"type":"string","minLength":15,"maxLength":15}},"required":["payin_quote_id"],"description":"Start payin"}},"required":["instance_id"]},
    method: "post",
    pathTemplate: "/v1/instances/{instance_id}/payins/evm",
    executionParameters: [{"name":"instance_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1InstancesPayinQuotes", {
    name: "PostV1InstancesPayinQuotes",
    description: `Create Payin Quote`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"requestBody":{"type":"object","properties":{"blockchain_wallet_id":{"type":["string","null"],"minLength":15,"maxLength":15},"wallet_id":{"type":["string","null"],"minLength":15,"maxLength":15},"currency_type":{"type":"string","enum":["sender","receiver"],"description":""},"cover_fees":{"type":["boolean","null"],"description":"If true, the sender will cover the fees. If false, the receiver will cover the fees."},"request_amount":{"type":"number","minimum":500,"description":"1000 represents 10.00, 2050 represents 20.50"},"payment_method":{"type":"string","enum":["ach","wire","pix","ted","spei","transfers","pse","international_swift","rtp"]},"token":{"type":"string","enum":["USDC","USDT","USDB"]},"partner_fee_id":{"type":["string","null"],"minLength":15,"maxLength":15},"payer_rules":{"type":["object","null"],"properties":{"pix_allowed_tax_ids":{"type":["array","null"],"items":{"type":"string","example":"123.456.789-09"}},"transfers_allowed_tax_id":{"type":["string","null"],"example":"20-12345678-3"},"pse_allowed_tax_ids":{"type":["array","null"],"items":{"type":"string","example":"1234567890"}},"pse_full_name":{"type":["string","null"],"maxLength":50},"pse_document_type":{"type":["string","null"],"enum":["CC","NIT"]},"pse_document_number":{"type":["string","null"]},"pse_email":{"type":["string","null"],"format":"email"},"pse_phone":{"type":["string","null"],"pattern":"^\\+573\\d{9}$"},"pse_bank_code":{"type":["string","null"]}}},"is_otc":{"type":["boolean","null"],"description":"If true, the payin quote is for an OTC (Over the Counter) transaction"}},"required":["currency_type","request_amount","payment_method","token"],"description":"Create a new quote"}},"required":["instance_id"]},
    method: "post",
    pathTemplate: "/v1/instances/{instance_id}/payin-quotes",
    executionParameters: [{"name":"instance_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1InstancesPayinQuotesFx", {
    name: "PostV1InstancesPayinQuotesFx",
    description: `Get FX Rate`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"requestBody":{"type":"object","properties":{"from":{"type":"string","enum":["USDC","USDT","USDB","BRL","USD","MXN","COP","ARS","EUR"]},"to":{"type":"string","enum":["USDC","USDT","USDB","BRL","USD","MXN","COP","ARS","EUR"]},"request_amount":{"type":"number","minimum":500,"description":"1000 represents 10.00, 2050 represents 20.50"},"currency_type":{"type":"string","enum":["sender","receiver"],"description":""}},"required":["from","to","request_amount","currency_type"],"description":"Check FX rate"}},"required":["instance_id"]},
    method: "post",
    pathTemplate: "/v1/instances/{instance_id}/payin-quotes/fx",
    executionParameters: [{"name":"instance_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1InstancesInvites", {
    name: "GetV1InstancesInvites",
    description: `Retrieve Invites`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15}},"required":["instance_id"]},
    method: "get",
    pathTemplate: "/v1/instances/{instance_id}/invites",
    executionParameters: [{"name":"instance_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1InstancesInvites", {
    name: "PostV1InstancesInvites",
    description: `Create Invite`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"requestBody":{"type":"object","properties":{"email":{"type":"string","format":"email"},"user_role":{"type":"string","enum":["owner","admin","finance","checker","operations","developer","viewer"]}},"required":["email","user_role"],"description":"Create a new invite"}},"required":["instance_id"]},
    method: "post",
    pathTemplate: "/v1/instances/{instance_id}/invites",
    executionParameters: [{"name":"instance_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1EInvitesById", {
    name: "GetV1EInvitesById",
    description: `Retrieve Invite (External)`,
    inputSchema: {"type":"object","properties":{"id":{"type":"string","minLength":15,"maxLength":15}},"required":["id"]},
    method: "get",
    pathTemplate: "/v1/e/invites/{id}",
    executionParameters: [{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1InvitesAccept", {
    name: "PostV1InvitesAccept",
    description: `Accept Invite`,
    inputSchema: {"type":"object","properties":{"id":{"type":"string","minLength":15,"maxLength":15}},"required":["id"]},
    method: "post",
    pathTemplate: "/v1/invites/{id}/accept",
    executionParameters: [{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["DeleteV1InstancesInvitesById", {
    name: "DeleteV1InstancesInvitesById",
    description: `Delete Invite`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"id":{"type":"string","minLength":15,"maxLength":15}},"required":["instance_id","id"]},
    method: "delete",
    pathTemplate: "/v1/instances/{instance_id}/invites/{id}",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1InstancesPartnerFees", {
    name: "GetV1InstancesPartnerFees",
    description: `Retrieve Partner Fees`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15}},"required":["instance_id"]},
    method: "get",
    pathTemplate: "/v1/instances/{instance_id}/partner-fees",
    executionParameters: [{"name":"instance_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1InstancesPartnerFees", {
    name: "PostV1InstancesPartnerFees",
    description: `Add Partner Fee`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"requestBody":{"type":"object","properties":{"name":{"type":"string"},"payout_percentage_fee":{"type":"number","minimum":0,"maximum":1000},"payout_flat_fee":{"type":"number","minimum":0,"maximum":100000},"payin_percentage_fee":{"type":"number","minimum":0,"maximum":1000},"payin_flat_fee":{"type":"number","minimum":0,"maximum":100000},"virtual_account_set":{"type":["boolean","null"],"default":false}},"required":["name","payout_percentage_fee","payout_flat_fee","payin_percentage_fee","payin_flat_fee"],"description":"Create a new blockchain wallet"}},"required":["instance_id"]},
    method: "post",
    pathTemplate: "/v1/instances/{instance_id}/partner-fees",
    executionParameters: [{"name":"instance_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1InstancesPartnerFeesById", {
    name: "GetV1InstancesPartnerFeesById",
    description: `Retrieve Partner Fee`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"id":{"type":"string","minLength":15,"maxLength":15}},"required":["instance_id","id"]},
    method: "get",
    pathTemplate: "/v1/instances/{instance_id}/partner-fees/{id}",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["DeleteV1InstancesPartnerFeesById", {
    name: "DeleteV1InstancesPartnerFeesById",
    description: `Remove Partner Fee`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"id":{"type":"string","minLength":15,"maxLength":15}},"required":["instance_id","id"]},
    method: "delete",
    pathTemplate: "/v1/instances/{instance_id}/partner-fees/{id}",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1InstancesBillingSubscription", {
    name: "GetV1InstancesBillingSubscription",
    description: `Returns subscription config and primary payment method metadata for the instance`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15}},"required":["instance_id"]},
    method: "get",
    pathTemplate: "/v1/instances/{instance_id}/billing/subscription",
    executionParameters: [{"name":"instance_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1InstancesBillingDetails", {
    name: "GetV1InstancesBillingDetails",
    description: `Returns billing contact details used for invoices`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15}},"required":["instance_id"]},
    method: "get",
    pathTemplate: "/v1/instances/{instance_id}/billing/details",
    executionParameters: [{"name":"instance_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PutV1InstancesBillingDetails", {
    name: "PutV1InstancesBillingDetails",
    description: `Updates billing contact details used for invoices`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"requestBody":{"type":"object","properties":{"name":{"type":"string"},"email":{"anyOf":[{"type":"string","format":"email"},{"type":"string","enum":[""]}]},"tax_id":{"type":"string"},"address_line_1":{"type":"string"},"address_line_2":{"type":"string"},"city":{"type":"string"},"state_province_region":{"type":"string"},"postal_code":{"type":"string"},"country":{"type":"string"},"copy_emails":{"type":"array","items":{"type":"string","format":"email"},"default":[],"description":"Optional CC emails for billing communications"}},"required":["name","email","tax_id","address_line_1","address_line_2","city","state_province_region","postal_code","country"],"description":"The JSON request body."}},"required":["instance_id"]},
    method: "put",
    pathTemplate: "/v1/instances/{instance_id}/billing/details",
    executionParameters: [{"name":"instance_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1InstancesBillingInvoices", {
    name: "GetV1InstancesBillingInvoices",
    description: `Retrieves current month usage and all historical invoices for an instance`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15}},"required":["instance_id"]},
    method: "get",
    pathTemplate: "/v1/instances/{instance_id}/billing/invoices",
    executionParameters: [{"name":"instance_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1InstancesBillingInvoicesByInvoiceId", {
    name: "GetV1InstancesBillingInvoicesByInvoiceId",
    description: `Retrieves a specific invoice`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"invoice_id":{"type":"string"}},"required":["instance_id","invoice_id"]},
    method: "get",
    pathTemplate: "/v1/instances/{instance_id}/billing/invoices/{invoice_id}",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"invoice_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1InstancesBillingInvoicesPdf", {
    name: "GetV1InstancesBillingInvoicesPdf",
    description: `Returns a signed URL to the partner fee collection invoice PDF. URL expires in 15 minutes.`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"invoice_id":{"type":"string"}},"required":["instance_id","invoice_id"]},
    method: "get",
    pathTemplate: "/v1/instances/{instance_id}/billing/invoices/{invoice_id}/pdf",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"invoice_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1InstancesBillingInvoicesPay", {
    name: "PostV1InstancesBillingInvoicesPay",
    description: `Initiates payment of an invoice via blockchain. Returns wallet address to send payment to.`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"invoice_id":{"type":"string"}},"required":["instance_id","invoice_id"]},
    method: "post",
    pathTemplate: "/v1/instances/{instance_id}/billing/invoices/{invoice_id}/pay",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"invoice_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1InstancesBillingInvoicesCollect", {
    name: "PostV1InstancesBillingInvoicesCollect",
    description: `Initiates collection of partner fees from an invoice via blockchain transfer.`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"invoice_id":{"type":"string"},"requestBody":{"type":"object","properties":{"network":{"type":"string","enum":["polygon","base","arbitrum","ethereum","tron","solana","stellar"],"description":"Blockchain network for collection"},"token":{"type":"string","enum":["USDC","USDT"],"description":"Token to collect"},"wallet_address":{"type":"string","description":"Wallet address to receive partner fees"}},"required":["network","token","wallet_address"],"description":"The JSON request body."}},"required":["instance_id","invoice_id"]},
    method: "post",
    pathTemplate: "/v1/instances/{instance_id}/billing/invoices/{invoice_id}/collect",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"invoice_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1InstancesBillingPortalSession", {
    name: "PostV1InstancesBillingPortalSession",
    description: `Creates a Stripe Customer Portal session for managing payment methods, returns a URL to redirect the user to`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15}},"required":["instance_id"]},
    method: "post",
    pathTemplate: "/v1/instances/{instance_id}/billing/portal-session",
    executionParameters: [{"name":"instance_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1InstancesBillingPaymentMethod", {
    name: "GetV1InstancesBillingPaymentMethod",
    description: `Retrieves the default payment method for the instance from Stripe.`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15}},"required":["instance_id"]},
    method: "get",
    pathTemplate: "/v1/instances/{instance_id}/billing/payment-method",
    executionParameters: [{"name":"instance_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1InstancesReceiversWallets", {
    name: "GetV1InstancesReceiversWallets",
    description: `Retrieve Wallets`,
    inputSchema: {"type":"object","properties":{"receiver_id":{"type":"string","minLength":15,"maxLength":15},"instance_id":{"type":"string","minLength":15,"maxLength":15}},"required":["receiver_id","instance_id"]},
    method: "get",
    pathTemplate: "/v1/instances/{instance_id}/receivers/{receiver_id}/wallets",
    executionParameters: [{"name":"receiver_id","in":"path"},{"name":"instance_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1InstancesReceiversWallets", {
    name: "PostV1InstancesReceiversWallets",
    description: `Create Wallet`,
    inputSchema: {"type":"object","properties":{"receiver_id":{"type":"string","minLength":15,"maxLength":15},"instance_id":{"type":"string","minLength":15,"maxLength":15},"requestBody":{"type":"object","properties":{"network":{"type":"string","enum":["base","sepolia","arbitrum_sepolia","base_sepolia","arbitrum","polygon","polygon_amoy","ethereum","stellar","stellar_testnet","tron","solana","solana_devnet"]},"external_id":{"type":["string","null"],"maxLength":255},"name":{"type":"string","maxLength":255}},"required":["network","name"],"description":"Create a new wallet"}},"required":["receiver_id","instance_id"]},
    method: "post",
    pathTemplate: "/v1/instances/{instance_id}/receivers/{receiver_id}/wallets",
    executionParameters: [{"name":"receiver_id","in":"path"},{"name":"instance_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1InstancesReceiversWalletsById", {
    name: "GetV1InstancesReceiversWalletsById",
    description: `Retrieve Wallet`,
    inputSchema: {"type":"object","properties":{"receiver_id":{"type":"string","minLength":15,"maxLength":15},"instance_id":{"type":"string","minLength":15,"maxLength":15},"id":{"type":"string","minLength":15,"maxLength":15}},"required":["receiver_id","instance_id","id"]},
    method: "get",
    pathTemplate: "/v1/instances/{instance_id}/receivers/{receiver_id}/wallets/{id}",
    executionParameters: [{"name":"receiver_id","in":"path"},{"name":"instance_id","in":"path"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["DeleteV1InstancesReceiversWalletsById", {
    name: "DeleteV1InstancesReceiversWalletsById",
    description: `Remove Wallet`,
    inputSchema: {"type":"object","properties":{"receiver_id":{"type":"string","minLength":15,"maxLength":15},"instance_id":{"type":"string","minLength":15,"maxLength":15},"id":{"type":"string","minLength":15,"maxLength":15}},"required":["receiver_id","instance_id","id"]},
    method: "delete",
    pathTemplate: "/v1/instances/{instance_id}/receivers/{receiver_id}/wallets/{id}",
    executionParameters: [{"name":"receiver_id","in":"path"},{"name":"instance_id","in":"path"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1InstancesReceiversWalletsBalance", {
    name: "GetV1InstancesReceiversWalletsBalance",
    description: `Retrieve Wallet Balance`,
    inputSchema: {"type":"object","properties":{"receiver_id":{"type":"string","minLength":15,"maxLength":15},"instance_id":{"type":"string","minLength":15,"maxLength":15},"id":{"type":"string","minLength":15,"maxLength":15}},"required":["receiver_id","instance_id","id"]},
    method: "get",
    pathTemplate: "/v1/instances/{instance_id}/receivers/{receiver_id}/wallets/{id}/balance",
    executionParameters: [{"name":"receiver_id","in":"path"},{"name":"instance_id","in":"path"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1InstancesTransfersById", {
    name: "GetV1InstancesTransfersById",
    description: `Retrieve Transfer`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"id":{"type":"string","minLength":15,"maxLength":15}},"required":["instance_id","id"]},
    method: "get",
    pathTemplate: "/v1/instances/{instance_id}/transfers/{id}",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1ETransfersById", {
    name: "GetV1ETransfersById",
    description: `Retrieve Transfer Track`,
    inputSchema: {"type":"object","properties":{"id":{"type":"string","minLength":15,"maxLength":15}},"required":["id"]},
    method: "get",
    pathTemplate: "/v1/e/transfers/{id}",
    executionParameters: [{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1InstancesTransfers", {
    name: "GetV1InstancesTransfers",
    description: `Retrieve Transfers`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"limit":{"type":"string","enum":["10","50","100","200","500","1000"],"description":"Number of items to return"},"offset":{"type":"string","enum":["0","10","50","100","200","500","1000"],"description":"Number of items to skip"},"starting_after":{"type":"string","description":"A cursor for use in pagination. starting_after is an object ID that defines your place in the list."},"ending_before":{"type":"string","description":"A cursor for use in pagination. ending_before is an object ID that defines your place in the list."}},"required":["instance_id"]},
    method: "get",
    pathTemplate: "/v1/instances/{instance_id}/transfers",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"limit","in":"query"},{"name":"offset","in":"query"},{"name":"starting_after","in":"query"},{"name":"ending_before","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1InstancesTransfers", {
    name: "PostV1InstancesTransfers",
    description: `Create Transfer`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"requestBody":{"type":"object","properties":{"transfer_quote_id":{"type":"string","minLength":15,"maxLength":15}},"required":["transfer_quote_id"],"description":"Start transfer"}},"required":["instance_id"]},
    method: "post",
    pathTemplate: "/v1/instances/{instance_id}/transfers",
    executionParameters: [{"name":"instance_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1InstancesTransferQuotes", {
    name: "PostV1InstancesTransferQuotes",
    description: `Create Transfer Quote`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"requestBody":{"type":"object","properties":{"wallet_id":{"type":"string","minLength":15,"maxLength":15},"amount_reference":{"type":"string","enum":["sender","receiver"],"description":""},"cover_fees":{"type":["boolean","null"],"description":"If true, the sender will cover the fees. If false, the receiver will cover the fees."},"request_amount":{"type":"number","minimum":1,"description":"100 represents 1, 2050 represents 20.50"},"sender_token":{"type":"string","enum":["USDC","USDT","USDB"]},"receiver_wallet_address":{"type":"string","minLength":32,"maxLength":64},"receiver_token":{"type":"string","enum":["USDC","USDT","USDB"]},"receiver_network":{"type":"string","enum":["base","sepolia","arbitrum_sepolia","base_sepolia","arbitrum","polygon","polygon_amoy","ethereum","stellar","stellar_testnet","tron","solana","solana_devnet"]},"partner_fee_id":{"type":["string","null"],"minLength":15,"maxLength":15}},"required":["wallet_id","amount_reference","request_amount","sender_token","receiver_wallet_address","receiver_token","receiver_network"],"description":"Create a new quote"}},"required":["instance_id"]},
    method: "post",
    pathTemplate: "/v1/instances/{instance_id}/transfer-quotes",
    executionParameters: [{"name":"instance_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1EInstancesTos", {
    name: "PostV1EInstancesTos",
    description: `Initiate Terms of Service`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"requestBody":{"type":"object","properties":{"idempotency_key":{"type":"string","format":"uuid"},"receiver_id":{"type":["string","null"],"minLength":15,"maxLength":15},"redirect_url":{"type":["string","null"],"format":"uri"}},"required":["idempotency_key"],"description":"Initiate a new terms of service"}},"required":["instance_id"]},
    method: "post",
    pathTemplate: "/v1/e/instances/{instance_id}/tos",
    executionParameters: [{"name":"instance_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PutV1ETos", {
    name: "PutV1ETos",
    description: `Accept Terms of Service`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"session_token":{"type":"string"},"idempotency_key":{"type":"string","format":"uuid"},"receiver_id":{"type":["string","null"],"minLength":15,"maxLength":15},"session":{"type":["string","null"]}},"required":["session_token","idempotency_key"],"description":"Accept terms of service"}}},
    method: "put",
    pathTemplate: "/v1/e/tos",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1InstancesReceiversVirtualAccounts", {
    name: "GetV1InstancesReceiversVirtualAccounts",
    description: `Retrieve Virtual Accounts`,
    inputSchema: {"type":"object","properties":{"receiver_id":{"type":"string","minLength":15,"maxLength":15},"instance_id":{"type":"string","minLength":15,"maxLength":15}},"required":["receiver_id","instance_id"]},
    method: "get",
    pathTemplate: "/v1/instances/{instance_id}/receivers/{receiver_id}/virtual-accounts",
    executionParameters: [{"name":"receiver_id","in":"path"},{"name":"instance_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1InstancesReceiversVirtualAccounts", {
    name: "PostV1InstancesReceiversVirtualAccounts",
    description: `Create Virtual Account`,
    inputSchema: {"type":"object","properties":{"receiver_id":{"type":"string","minLength":15,"maxLength":15},"instance_id":{"type":"string","minLength":15,"maxLength":15},"requestBody":{"type":"object","properties":{"banking_partner":{"type":"string","enum":["jpmorgan","citi","hsbc","cfsb"]},"token":{"type":"string","enum":["USDC","USDT","USDB"]},"blockchain_wallet_id":{"type":"string","minLength":15,"maxLength":15},"sole_proprietor_doc_type":{"type":["string","null"],"enum":["master_service_agreement","salary_slip","bank_statement"]},"sole_proprietor_doc_file":{"type":["string","null"],"format":"uri"}},"required":["banking_partner","token","blockchain_wallet_id"],"description":"Create a new virtual account"}},"required":["receiver_id","instance_id"]},
    method: "post",
    pathTemplate: "/v1/instances/{instance_id}/receivers/{receiver_id}/virtual-accounts",
    executionParameters: [{"name":"receiver_id","in":"path"},{"name":"instance_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1InstancesReceiversVirtualAccountsById", {
    name: "GetV1InstancesReceiversVirtualAccountsById",
    description: `Retrieve Virtual Account`,
    inputSchema: {"type":"object","properties":{"receiver_id":{"type":"string","minLength":15,"maxLength":15},"instance_id":{"type":"string","minLength":15,"maxLength":15},"id":{"type":"string","minLength":15,"maxLength":15}},"required":["receiver_id","instance_id","id"]},
    method: "get",
    pathTemplate: "/v1/instances/{instance_id}/receivers/{receiver_id}/virtual-accounts/{id}",
    executionParameters: [{"name":"receiver_id","in":"path"},{"name":"instance_id","in":"path"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PutV1InstancesReceiversVirtualAccountsById", {
    name: "PutV1InstancesReceiversVirtualAccountsById",
    description: `Update Virtual Account`,
    inputSchema: {"type":"object","properties":{"receiver_id":{"type":"string","minLength":15,"maxLength":15},"instance_id":{"type":"string","minLength":15,"maxLength":15},"id":{"type":"string","minLength":15,"maxLength":15},"requestBody":{"type":"object","properties":{"token":{"type":"string","enum":["USDC","USDT","USDB"]},"blockchain_wallet_id":{"type":"string","minLength":15,"maxLength":15}},"required":["token","blockchain_wallet_id"],"description":"Update a new virtual account"}},"required":["receiver_id","instance_id","id"]},
    method: "put",
    pathTemplate: "/v1/instances/{instance_id}/receivers/{receiver_id}/virtual-accounts/{id}",
    executionParameters: [{"name":"receiver_id","in":"path"},{"name":"instance_id","in":"path"},{"name":"id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1InstancesReceiversBankAccountsOfframpWallets", {
    name: "GetV1InstancesReceiversBankAccountsOfframpWallets",
    description: `Get Offramp Wallets`,
    inputSchema: {"type":"object","properties":{"receiver_id":{"type":"string","minLength":15,"maxLength":15},"instance_id":{"type":"string","minLength":15,"maxLength":15},"bank_account_id":{"type":"string","minLength":15,"maxLength":15}},"required":["receiver_id","instance_id","bank_account_id"]},
    method: "get",
    pathTemplate: "/v1/instances/{instance_id}/receivers/{receiver_id}/bank-accounts/{bank_account_id}/offramp-wallets",
    executionParameters: [{"name":"receiver_id","in":"path"},{"name":"instance_id","in":"path"},{"name":"bank_account_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1InstancesReceiversBankAccountsOfframpWallets", {
    name: "PostV1InstancesReceiversBankAccountsOfframpWallets",
    description: `Create Offramp Wallet`,
    inputSchema: {"type":"object","properties":{"receiver_id":{"type":"string","minLength":15,"maxLength":15},"instance_id":{"type":"string","minLength":15,"maxLength":15},"bank_account_id":{"type":"string","minLength":15,"maxLength":15},"requestBody":{"type":"object","properties":{"external_id":{"type":["string","null"]},"network":{"type":"string","enum":["tron","solana","solana_devnet","arbitrum","base","ethereum","polygon","sepolia","arbitrum_sepolia","base_sepolia","polygon_amoy"]}},"required":["network"],"description":"Create a new offramp wallet"}},"required":["receiver_id","instance_id","bank_account_id"]},
    method: "post",
    pathTemplate: "/v1/instances/{instance_id}/receivers/{receiver_id}/bank-accounts/{bank_account_id}/offramp-wallets",
    executionParameters: [{"name":"receiver_id","in":"path"},{"name":"instance_id","in":"path"},{"name":"bank_account_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1InstancesReceiversBankAccountsOfframpWalletsById", {
    name: "GetV1InstancesReceiversBankAccountsOfframpWalletsById",
    description: `Get Offramp Wallet`,
    inputSchema: {"type":"object","properties":{"receiver_id":{"type":"string","minLength":15,"maxLength":15},"instance_id":{"type":"string","minLength":15,"maxLength":15},"bank_account_id":{"type":"string","minLength":15,"maxLength":15},"id":{"type":"string","minLength":15,"maxLength":15}},"required":["receiver_id","instance_id","bank_account_id","id"]},
    method: "get",
    pathTemplate: "/v1/instances/{instance_id}/receivers/{receiver_id}/bank-accounts/{bank_account_id}/offramp-wallets/{id}",
    executionParameters: [{"name":"receiver_id","in":"path"},{"name":"instance_id","in":"path"},{"name":"bank_account_id","in":"path"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1InstancesReceiversLimitIncrease", {
    name: "GetV1InstancesReceiversLimitIncrease",
    description: `Retrieve Limit Increase Requests`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"receiver_id":{"type":"string","minLength":15,"maxLength":15}},"required":["instance_id","receiver_id"]},
    method: "get",
    pathTemplate: "/v1/instances/{instance_id}/receivers/{receiver_id}/limit-increase",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"receiver_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1InstancesReceiversLimitIncrease", {
    name: "PostV1InstancesReceiversLimitIncrease",
    description: `Request Limit Increase`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"receiver_id":{"type":"string","minLength":15,"maxLength":15},"requestBody":{"type":"object","properties":{"per_transaction":{"type":["integer","null"],"maximum":100000000000},"daily":{"type":["integer","null"],"maximum":100000000000},"monthly":{"type":["integer","null"],"maximum":100000000000},"supporting_document_type":{"type":"string","enum":["individual_bank_statement","individual_tax_return","individual_proof_of_income","business_bank_statement","business_financial_statements","business_tax_return"]},"supporting_document_file":{"type":"string","format":"uri"}},"required":["per_transaction","daily","monthly","supporting_document_type","supporting_document_file"],"description":"Request new limit increase"}},"required":["instance_id","receiver_id"]},
    method: "post",
    pathTemplate: "/v1/instances/{instance_id}/receivers/{receiver_id}/limit-increase",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"receiver_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1InstancesBillingFees", {
    name: "GetV1InstancesBillingFees",
    description: `Get all fees for an instance, sorted by payment method (fiat first, then blockchain)`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15,"description":"Instance id"}},"required":["instance_id"]},
    method: "get",
    pathTemplate: "/v1/instances/{instance_id}/billing/fees",
    executionParameters: [{"name":"instance_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1InstancesFeedback", {
    name: "GetV1InstancesFeedback",
    description: `List feedback`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string"},"limit":{"type":"string","enum":["10","50","100","200","500","1000"],"description":"Number of items to return"},"offset":{"type":"string","enum":["0","10","50","100","200","500","1000"],"description":"Number of items to skip"},"starting_after":{"type":"string","description":"A cursor for use in pagination. starting_after is an object ID that defines your place in the list."},"ending_before":{"type":"string","description":"A cursor for use in pagination. ending_before is an object ID that defines your place in the list."},"type":{"type":"string","enum":["bug","suggestion","feedback","praise","complaint"]}},"required":["instance_id"]},
    method: "get",
    pathTemplate: "/v1/instances/{instance_id}/feedback",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"limit","in":"query"},{"name":"offset","in":"query"},{"name":"starting_after","in":"query"},{"name":"ending_before","in":"query"},{"name":"type","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1InstancesFeedback", {
    name: "PostV1InstancesFeedback",
    description: `Submit feedback`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string"},"requestBody":{"type":"object","properties":{"type":{"type":"string","enum":["bug","suggestion","feedback","praise"]},"title":{"type":"string","minLength":1,"maxLength":200},"description":{"type":"string","minLength":1,"maxLength":5000},"page_url":{"type":["string","null"],"maxLength":2000},"user_agent":{"type":["string","null"],"maxLength":500}},"required":["type","title","description"],"description":"The JSON request body."}},"required":["instance_id"]},
    method: "post",
    pathTemplate: "/v1/instances/{instance_id}/feedback",
    executionParameters: [{"name":"instance_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1InstancesReceiversRfi", {
    name: "GetV1InstancesReceiversRfi",
    description: `Returns the open (pending) RFI for this receiver, or null if the receiver has no pending RFI.`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"receiver_id":{"type":"string","minLength":15,"maxLength":15}},"required":["instance_id","receiver_id"]},
    method: "get",
    pathTemplate: "/v1/instances/{instance_id}/receivers/{receiver_id}/rfi",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"receiver_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1InstancesReceiversRfi", {
    name: "PostV1InstancesReceiversRfi",
    description: `Submit a flat response object for the open RFI. On success flips kyc_status back to verifying. Returns \`{ success: false, reason }\` when no pending RFI exists, callers should refetch the RFI state instead of retrying.`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"receiver_id":{"type":"string","minLength":15,"maxLength":15},"requestBody":{"type":"object","additionalProperties":{},"description":"The JSON request body."}},"required":["instance_id","receiver_id"]},
    method: "post",
    pathTemplate: "/v1/instances/{instance_id}/receivers/{receiver_id}/rfi",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"receiver_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1InstancesReceiversRfiExternalToken", {
    name: "PostV1InstancesReceiversRfiExternalToken",
    description: `Mint a 27-day JWT that lets anyone with the link answer the receiver's open RFI without logging in.`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"receiver_id":{"type":"string","minLength":15,"maxLength":15}},"required":["instance_id","receiver_id"]},
    method: "post",
    pathTemplate: "/v1/instances/{instance_id}/receivers/{receiver_id}/rfi/external-token",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"receiver_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1EInstancesReceiversRfi", {
    name: "GetV1EInstancesReceiversRfi",
    description: `Get Open RFI via Invite Token`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"receiver_id":{"type":"string","minLength":15,"maxLength":15},"token":{"type":"string"}},"required":["instance_id","receiver_id","token"]},
    method: "get",
    pathTemplate: "/v1/e/instances/{instance_id}/receivers/{receiver_id}/rfi",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"receiver_id","in":"path"},{"name":"token","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1EInstancesReceiversRfi", {
    name: "PostV1EInstancesReceiversRfi",
    description: `Submit RFI Response via Invite Token`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"receiver_id":{"type":"string","minLength":15,"maxLength":15},"token":{"type":"string"},"requestBody":{"type":"object","additionalProperties":{},"description":"The JSON request body."}},"required":["instance_id","receiver_id","token"]},
    method: "post",
    pathTemplate: "/v1/e/instances/{instance_id}/receivers/{receiver_id}/rfi",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"receiver_id","in":"path"},{"name":"token","in":"query"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1InstancesCustomersLimitIncrease", {
    name: "GetV1InstancesCustomersLimitIncrease",
    description: `Retrieve Limit Increase Requests`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"customer_id":{"type":"string","minLength":15,"maxLength":15,"description":"Customer ID"}},"required":["instance_id","customer_id"]},
    method: "get",
    pathTemplate: "/v1/instances/{instance_id}/customers/{customer_id}/limit-increase",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"customer_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1InstancesCustomersLimitIncrease", {
    name: "PostV1InstancesCustomersLimitIncrease",
    description: `Request Limit Increase`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"customer_id":{"type":"string","minLength":15,"maxLength":15,"description":"Customer ID"},"requestBody":{"type":"object","properties":{"per_transaction":{"type":["integer","null"],"maximum":100000000000},"daily":{"type":["integer","null"],"maximum":100000000000},"monthly":{"type":["integer","null"],"maximum":100000000000},"supporting_document_type":{"type":"string","enum":["individual_bank_statement","individual_tax_return","individual_proof_of_income","business_bank_statement","business_financial_statements","business_tax_return"]},"supporting_document_file":{"type":"string","format":"uri"}},"required":["per_transaction","daily","monthly","supporting_document_type","supporting_document_file"],"description":"Request new limit increase"}},"required":["instance_id","customer_id"]},
    method: "post",
    pathTemplate: "/v1/instances/{instance_id}/customers/{customer_id}/limit-increase",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"customer_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1InstancesCustomersBankAccountsOfframpWallets", {
    name: "GetV1InstancesCustomersBankAccountsOfframpWallets",
    description: `Get Offramp Wallets`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"customer_id":{"type":"string","minLength":15,"maxLength":15,"description":"Customer ID"},"bank_account_id":{"type":"string","minLength":15,"maxLength":15}},"required":["instance_id","customer_id","bank_account_id"]},
    method: "get",
    pathTemplate: "/v1/instances/{instance_id}/customers/{customer_id}/bank-accounts/{bank_account_id}/offramp-wallets",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"customer_id","in":"path"},{"name":"bank_account_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1InstancesCustomersBankAccountsOfframpWallets", {
    name: "PostV1InstancesCustomersBankAccountsOfframpWallets",
    description: `Create Offramp Wallet`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"customer_id":{"type":"string","minLength":15,"maxLength":15,"description":"Customer ID"},"bank_account_id":{"type":"string","minLength":15,"maxLength":15},"requestBody":{"type":"object","properties":{"external_id":{"type":["string","null"]},"network":{"type":"string","enum":["tron","solana","solana_devnet","arbitrum","base","ethereum","polygon","sepolia","arbitrum_sepolia","base_sepolia","polygon_amoy"]}},"required":["network"],"description":"Create a new offramp wallet"}},"required":["instance_id","customer_id","bank_account_id"]},
    method: "post",
    pathTemplate: "/v1/instances/{instance_id}/customers/{customer_id}/bank-accounts/{bank_account_id}/offramp-wallets",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"customer_id","in":"path"},{"name":"bank_account_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1InstancesCustomersBankAccountsOfframpWalletsById", {
    name: "GetV1InstancesCustomersBankAccountsOfframpWalletsById",
    description: `Get Offramp Wallet`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"customer_id":{"type":"string","minLength":15,"maxLength":15,"description":"Customer ID"},"bank_account_id":{"type":"string","minLength":15,"maxLength":15},"id":{"type":"string","minLength":15,"maxLength":15}},"required":["instance_id","customer_id","bank_account_id","id"]},
    method: "get",
    pathTemplate: "/v1/instances/{instance_id}/customers/{customer_id}/bank-accounts/{bank_account_id}/offramp-wallets/{id}",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"customer_id","in":"path"},{"name":"bank_account_id","in":"path"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1InstancesCustomersWallets", {
    name: "GetV1InstancesCustomersWallets",
    description: `Retrieve Wallets`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"customer_id":{"type":"string","minLength":15,"maxLength":15,"description":"Customer ID"}},"required":["instance_id","customer_id"]},
    method: "get",
    pathTemplate: "/v1/instances/{instance_id}/customers/{customer_id}/wallets",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"customer_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1InstancesCustomersWallets", {
    name: "PostV1InstancesCustomersWallets",
    description: `Create Wallet`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"customer_id":{"type":"string","minLength":15,"maxLength":15,"description":"Customer ID"},"requestBody":{"type":"object","properties":{"network":{"type":"string","enum":["base","sepolia","arbitrum_sepolia","base_sepolia","arbitrum","polygon","polygon_amoy","ethereum","stellar","stellar_testnet","tron","solana","solana_devnet"]},"external_id":{"type":["string","null"],"maxLength":255},"name":{"type":"string","maxLength":255}},"required":["network","name"],"description":"Create a new wallet"}},"required":["instance_id","customer_id"]},
    method: "post",
    pathTemplate: "/v1/instances/{instance_id}/customers/{customer_id}/wallets",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"customer_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1InstancesCustomersWalletsById", {
    name: "GetV1InstancesCustomersWalletsById",
    description: `Retrieve Wallet`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"customer_id":{"type":"string","minLength":15,"maxLength":15,"description":"Customer ID"},"id":{"type":"string","minLength":15,"maxLength":15}},"required":["instance_id","customer_id","id"]},
    method: "get",
    pathTemplate: "/v1/instances/{instance_id}/customers/{customer_id}/wallets/{id}",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"customer_id","in":"path"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["DeleteV1InstancesCustomersWalletsById", {
    name: "DeleteV1InstancesCustomersWalletsById",
    description: `Remove Wallet`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"customer_id":{"type":"string","minLength":15,"maxLength":15,"description":"Customer ID"},"id":{"type":"string","minLength":15,"maxLength":15}},"required":["instance_id","customer_id","id"]},
    method: "delete",
    pathTemplate: "/v1/instances/{instance_id}/customers/{customer_id}/wallets/{id}",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"customer_id","in":"path"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1InstancesCustomersWalletsBalance", {
    name: "GetV1InstancesCustomersWalletsBalance",
    description: `Retrieve Wallet Balance`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"customer_id":{"type":"string","minLength":15,"maxLength":15,"description":"Customer ID"},"id":{"type":"string","minLength":15,"maxLength":15}},"required":["instance_id","customer_id","id"]},
    method: "get",
    pathTemplate: "/v1/instances/{instance_id}/customers/{customer_id}/wallets/{id}/balance",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"customer_id","in":"path"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1InstancesCustomersBlockchainWalletsSignMessage", {
    name: "GetV1InstancesCustomersBlockchainWalletsSignMessage",
    description: `Retrieve Blockchain Wallet Message`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"customer_id":{"type":"string","minLength":15,"maxLength":15,"description":"Customer ID"}},"required":["instance_id","customer_id"]},
    method: "get",
    pathTemplate: "/v1/instances/{instance_id}/customers/{customer_id}/blockchain-wallets/sign-message",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"customer_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1InstancesCustomersBlockchainWallets", {
    name: "GetV1InstancesCustomersBlockchainWallets",
    description: `Retrieve Blockchain Wallets`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"customer_id":{"type":"string","minLength":15,"maxLength":15,"description":"Customer ID"}},"required":["instance_id","customer_id"]},
    method: "get",
    pathTemplate: "/v1/instances/{instance_id}/customers/{customer_id}/blockchain-wallets",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"customer_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1InstancesCustomersBlockchainWallets", {
    name: "PostV1InstancesCustomersBlockchainWallets",
    description: `Add Blockchain Wallet`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"customer_id":{"type":"string","minLength":15,"maxLength":15,"description":"Customer ID"},"requestBody":{"type":"object","properties":{"name":{"type":"string"},"network":{"type":"string","enum":["base","sepolia","arbitrum_sepolia","base_sepolia","arbitrum","polygon","polygon_amoy","ethereum","stellar","stellar_testnet","tron","solana","solana_devnet"]},"signature_tx_hash":{"type":["string","null"]},"address":{"type":["string","null"]},"is_account_abstraction":{"type":["boolean","null"]}},"required":["name","network"],"description":"Create a new blockchain wallet"}},"required":["instance_id","customer_id"]},
    method: "post",
    pathTemplate: "/v1/instances/{instance_id}/customers/{customer_id}/blockchain-wallets",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"customer_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1InstancesCustomersBlockchainWalletsById", {
    name: "GetV1InstancesCustomersBlockchainWalletsById",
    description: `Retrieve Blockchain Wallet`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"customer_id":{"type":"string","minLength":15,"maxLength":15,"description":"Customer ID"},"id":{"type":"string","minLength":15,"maxLength":15}},"required":["instance_id","customer_id","id"]},
    method: "get",
    pathTemplate: "/v1/instances/{instance_id}/customers/{customer_id}/blockchain-wallets/{id}",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"customer_id","in":"path"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["DeleteV1InstancesCustomersBlockchainWalletsById", {
    name: "DeleteV1InstancesCustomersBlockchainWalletsById",
    description: `Remove Blockchain Wallet`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"customer_id":{"type":"string","minLength":15,"maxLength":15,"description":"Customer ID"},"id":{"type":"string","minLength":15,"maxLength":15}},"required":["instance_id","customer_id","id"]},
    method: "delete",
    pathTemplate: "/v1/instances/{instance_id}/customers/{customer_id}/blockchain-wallets/{id}",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"customer_id","in":"path"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1InstancesCustomersBankAccounts", {
    name: "GetV1InstancesCustomersBankAccounts",
    description: `Retrieve Bank Accounts`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"customer_id":{"type":"string","minLength":15,"maxLength":15,"description":"Customer ID"},"status":{"type":"string","enum":["verifying","approved","rejected","deprecated"]},"type":{"type":"string","enum":["wire","ach","pix","pix_safe","ted","spei_bitso","transfers_bitso","ach_cop_bitso","international_swift","rtp","sepa"]},"name":{"type":"string"},"bank_account_id":{"type":"string"},"country":{"type":"string"}},"required":["instance_id","customer_id"]},
    method: "get",
    pathTemplate: "/v1/instances/{instance_id}/customers/{customer_id}/bank-accounts",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"customer_id","in":"path"},{"name":"status","in":"query"},{"name":"type","in":"query"},{"name":"name","in":"query"},{"name":"bank_account_id","in":"query"},{"name":"country","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1InstancesCustomersBankAccounts", {
    name: "PostV1InstancesCustomersBankAccounts",
    description: `Add Bank Account`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"customer_id":{"type":"string","minLength":15,"maxLength":15,"description":"Customer ID"},"requestBody":{"type":"object","properties":{"type":{"type":"string","enum":["wire","ach","pix","pix_safe","ted","spei_bitso","transfers_bitso","ach_cop_bitso","international_swift","rtp","sepa"]},"name":{"type":"string"},"status":{"type":["string","null"],"enum":["verifying","approved","rejected","deprecated"]},"recipient_relationship":{"type":["string","null"],"enum":["first_party","employee","independent_contractor","vendor_or_supplier","subsidiary_or_affiliate","merchant_or_partner","customer","landlord","family","other"]},"swift_payment_code":{"type":["string","null"],"enum":["ae_swift_str","ae_swift_tcs","ae_swift_ipc","ae_swift_ifs","ae_swift_sts","ae_swift_pms","ae_swift_its","ae_swift_gde","ae_swift_ots","ae_swift_tts","bh_swift_afa","bh_swift_afl","bh_swift_ats","bh_swift_cea","bh_swift_cel","bh_swift_chc","bh_swift_dla","bh_swift_dlf","bh_swift_dll","bh_swift_doe","bh_swift_dsa","bh_swift_dsf","bh_swift_dsl","bh_swift_fam","bh_swift_fda","bh_swift_fdl","bh_swift_fia","bh_swift_fil","bh_swift_fis","bh_swift_fsa","bh_swift_fsl","bh_swift_gde","bh_swift_gdi","bh_swift_gms","bh_swift_gos","bh_swift_gri","bh_swift_ifs","bh_swift_igd","bh_swift_iid","bh_swift_ins","bh_swift_iod","bh_swift_iol","bh_swift_ipc","bh_swift_ish","bh_swift_isl","bh_swift_iss","bh_swift_its","bh_swift_ldl","bh_swift_lds","bh_swift_lea","bh_swift_lel","bh_swift_lla","bh_swift_lll","bh_swift_ots","bh_swift_pip","bh_swift_pms","bh_swift_ppa","bh_swift_ppl","bh_swift_prr","bh_swift_prs","bh_swift_rda","bh_swift_rdl","bh_swift_rds","bh_swift_rea","bh_swift_rel","bh_swift_rfs","bh_swift_rls","bh_swift_sal","bh_swift_sco","bh_swift_sla","bh_swift_sll","bh_swift_str","bh_swift_sts","bh_swift_tcp","bh_swift_tcr","bh_swift_tcs","bh_swift_tts","ch_swift_ccdndr","ch_swift_cctfdr","ch_swift_cgoddr","ch_swift_cocadr","ch_swift_cstrdr","ch_swift_remtdr","cn_swift_ccdndr","cn_swift_cctfdr","cn_swift_cgoddr","cn_swift_cocadr","cn_swift_cstrdr","cn_swift_remtdr","hk_swift_charitabledonation","hk_swift_goods","hk_swift_personal","hk_swift_services","id_swift_2011","id_swift_2012","id_swift_2015","id_swift_2018","id_swift_2019","id_swift_2097","id_swift_2098","id_swift_2127","id_swift_2129","id_swift_2150","id_swift_2163","id_swift_2193","id_swift_2194","id_swift_2197","id_swift_2198","id_swift_2203","id_swift_2204","id_swift_2206","id_swift_2207","id_swift_2221","id_swift_2222","id_swift_2231","id_swift_2232","id_swift_2233","id_swift_2240","id_swift_2241","id_swift_2242","id_swift_2243","id_swift_2244","id_swift_2245","id_swift_2246","id_swift_2247","id_swift_2251","id_swift_2252","id_swift_2255","id_swift_2256","id_swift_2257","id_swift_2261","id_swift_2262","id_swift_2263","id_swift_2264","id_swift_2271","id_swift_2272","id_swift_2273","id_swift_2274","id_swift_2275","id_swift_2276","id_swift_2277","id_swift_2278","id_swift_2279","id_swift_2280","id_swift_2282","id_swift_2299","id_swift_2311","id_swift_2321","id_swift_2322","id_swift_2323","id_swift_2331","id_swift_2332","id_swift_2333","id_swift_2341","id_swift_2342","id_swift_2351","id_swift_2352","id_swift_2353","id_swift_2354","id_swift_2361","id_swift_2362","id_swift_2363","id_swift_2364","id_swift_2365","id_swift_2366","id_swift_2371","id_swift_2372","id_swift_2375","id_swift_2376","id_swift_2377","id_swift_2378","id_swift_2379","id_swift_2380","id_swift_2381","id_swift_2382","id_swift_2383","id_swift_2384","id_swift_2385","id_swift_2386","id_swift_2387","id_swift_2388","id_swift_2389","id_swift_2390","id_swift_2391","id_swift_2392","id_swift_2393","id_swift_2394","id_swift_2395","id_swift_2396","id_swift_2397","id_swift_2398","id_swift_2400","id_swift_2405","id_swift_2411","id_swift_2412","id_swift_2413","id_swift_2421","id_swift_2422","id_swift_2423","id_swift_2431","id_swift_2432","id_swift_2433","id_swift_2441","id_swift_2442","id_swift_2443","id_swift_2450","id_swift_2461","id_swift_2462","id_swift_2466","id_swift_2467","id_swift_2468","id_swift_2469","id_swift_2480","id_swift_2490","id_swift_2495","id_swift_2501","id_swift_2502","id_swift_2511","id_swift_2512","id_swift_2521","id_swift_2522","id_swift_2523","id_swift_2524","id_swift_2525","id_swift_2526","id_swift_2531","id_swift_2532","id_swift_2533","id_swift_2541","id_swift_2546","id_swift_2547","id_swift_2550","id_swift_2560","id_swift_2570","id_swift_2580","id_swift_2590","id_swift_2600","id_swift_2610","id_swift_2615","id_swift_2616","id_swift_2630","id_swift_2640","id_swift_2651","id_swift_2652","id_swift_2660","id_swift_2670","id_swift_2701","id_swift_2702","id_swift_2705","id_swift_2710","id_swift_2716","id_swift_2717","id_swift_2720","id_swift_2725","id_swift_2730","id_swift_2731","id_swift_2741","id_swift_2742","id_swift_2743","id_swift_2751","id_swift_2752","id_swift_2760","id_swift_2765","id_swift_2766","id_swift_2767","id_swift_2770","id_swift_2802","id_swift_2803","id_swift_2804","id_swift_2808","id_swift_2809","id_swift_2811","id_swift_2812","id_swift_2813","id_swift_2814","id_swift_2815","id_swift_2821","id_swift_2822","id_swift_2823","id_swift_2824","id_swift_2825","id_swift_2826","id_swift_2827","id_swift_2828","in_swift_p0001","in_swift_p0002","in_swift_p0003","in_swift_p0004","in_swift_p0005","in_swift_p0006","in_swift_p0007","in_swift_p0008","in_swift_p0009","in_swift_p0010","in_swift_p0011","in_swift_p0012","in_swift_p0013","in_swift_p0014","in_swift_p0015","in_swift_p0016","in_swift_p0017","in_swift_p0019","in_swift_p0020","in_swift_p0021","in_swift_p0022","in_swift_p0024","in_swift_p0025","in_swift_p0028","in_swift_p0029","in_swift_p0099","in_swift_p0101","in_swift_p0102","in_swift_p0103","in_swift_p0104","in_swift_p0105","in_swift_p0107","in_swift_p0108","in_swift_p0109","jp_swift_1001","jp_swift_1002","jp_swift_1003","jp_swift_1004","jp_swift_101","jp_swift_102","jp_swift_103","jp_swift_104","jp_swift_105","jp_swift_106","jp_swift_107","jp_swift_108","jp_swift_109","jp_swift_110","jp_swift_1101","jp_swift_1102","jp_swift_1103","jp_swift_1104","jp_swift_1105","jp_swift_1106","jp_swift_1107","jp_swift_1108","jp_swift_1109","jp_swift_111","jp_swift_1110","jp_swift_1111","jp_swift_1112","jp_swift_1201","jp_swift_1202","jp_swift_201","jp_swift_202","jp_swift_203","jp_swift_204","jp_swift_205","jp_swift_206","jp_swift_207","jp_swift_208","jp_swift_209","jp_swift_301","jp_swift_302","jp_swift_303","jp_swift_304","jp_swift_305","jp_swift_306","jp_swift_307","jp_swift_401","jp_swift_402","jp_swift_403","jp_swift_404","jp_swift_501","jp_swift_502","jp_swift_503","jp_swift_504","jp_swift_601","jp_swift_602","jp_swift_603","jp_swift_604","jp_swift_701","jp_swift_702","jp_swift_703","jp_swift_704","jp_swift_705","jp_swift_801","jp_swift_802","jp_swift_803","jp_swift_804","jp_swift_805","jp_swift_806","jp_swift_807","jp_swift_808","jp_swift_809","jp_swift_810","jp_swift_811","jp_swift_812","jp_swift_813","jp_swift_814","jp_swift_815","jp_swift_816","jp_swift_817","jp_swift_818","jp_swift_901","jp_swift_902","jp_swift_903","jp_swift_904","ke_swift_1001","ke_swift_1002","ke_swift_1101","ke_swift_1102","ke_swift_1201","ke_swift_1202","ke_swift_1206","ke_swift_1501","ke_swift_1518","ke_swift_1519","ke_swift_1527","ke_swift_1801","ke_swift_1802","ke_swift_1908","ke_swift_2101","ke_swift_2301","ke_swift_2501","ke_swift_2901","ke_swift_3001","ke_swift_3100","ke_swift_3101","ke_swift_3103","ke_swift_3200","ke_swift_3304","ke_swift_3509","ke_swift_3514","ke_swift_3801","ke_swift_4103","ke_swift_4301","ke_swift_4601","ke_swift_4702","ke_swift_512","ke_swift_6001","ke_swift_6002","ke_swift_6101","ke_swift_6102","ke_swift_6301","ke_swift_6401","ke_swift_6402","ke_swift_6501","ke_swift_6601","ke_swift_adtx","ke_swift_airb","ke_swift_artx","ke_swift_bech","ke_swift_bsd","ke_swift_bttx","ke_swift_busb","ke_swift_ccmc","ke_swift_cere","ke_swift_cfr","ke_swift_cgtx","ke_swift_chc","ke_swift_clot","ke_swift_comu","ke_swift_cons","ke_swift_cort","ke_swift_cotx","ke_swift_csdk","ke_swift_divd","ke_swift_edtx","ke_swift_educ","ke_swift_farm","ke_swift_foex","ke_swift_fuel","ke_swift_gokx","ke_swift_govt","ke_swift_hlfd","ke_swift_hlti","ke_swift_holi","ke_swift_ibld","ke_swift_inpc","ke_swift_insu","ke_swift_inte","ke_swift_intx","ke_swift_invs","ke_swift_istx","ke_swift_licf","ke_swift_lifi","ke_swift_loan","ke_swift_mach","ke_swift_mafc","ke_swift_mdcs","ke_swift_merc","ke_swift_paye","ke_swift_pena","ke_swift_pl39","ke_swift_pl40","ke_swift_pl41","ke_swift_pl42","ke_swift_pl43","ke_swift_pl44","ke_swift_pl45","ke_swift_pl46","ke_swift_pl47","ke_swift_pl48","ke_swift_pl49","ke_swift_pl50","ke_swift_pl51","ke_swift_pl52","ke_swift_pl53","ke_swift_ppti","ke_swift_prpy","ke_swift_psco","ke_swift_refu","ke_swift_relg","ke_swift_rent","ke_swift_ritx","ke_swift_rlwy","ke_swift_sala","ke_swift_savg","ke_swift_scho","ke_swift_sdtx","ke_swift_ship","ke_swift_swlf","ke_swift_taxr","ke_swift_taxs","ke_swift_tbil","ke_swift_tith","ke_swift_totx","ke_swift_trac","ke_swift_ubil","ke_swift_vatx","ke_swift_vipn","ke_swift_whld","ph_swift_1010101000","ph_swift_1010102001","ph_swift_1010102002","ph_swift_1010103001","ph_swift_1010103002","ph_swift_1010201000","ph_swift_1010202001","ph_swift_1010202002","ph_swift_1010203001","ph_swift_1010203002","ph_swift_1010300000","ph_swift_1110100001","ph_swift_1110200001","ph_swift_1110200002","ph_swift_1110200003","ph_swift_1110200004","ph_swift_1110300001","ph_swift_1110300002","ph_swift_1110300003","ph_swift_1110300004","ph_swift_1110400001","ph_swift_1110400002","ph_swift_1110400003","ph_swift_1110400004","ph_swift_1110400005","ph_swift_1110400006","ph_swift_1110500001","ph_swift_1110500002","ph_swift_1110500003","ph_swift_1110500004","ph_swift_1110500005","ph_swift_1110600001","ph_swift_1110700001","ph_swift_1310000001","ph_swift_1310000002","ph_swift_1310000003","ph_swift_1410100001","ph_swift_1410100002","ph_swift_1410200001","ph_swift_1410200002","ph_swift_1410200003","ph_swift_1410200004","ph_swift_1410300000","ph_swift_1410400000","ph_swift_1410500000","ph_swift_1410600000","ph_swift_1510000001","ph_swift_1510000002","ph_swift_1510000003","ph_swift_1510000004","ph_swift_1510000005","ph_swift_1510000006","ph_swift_1510000007","ph_swift_1510000008","ph_swift_1510000009","ph_swift_1510000010","ph_swift_1510000011","ph_swift_1510000012","ph_swift_1510000013","ph_swift_1510000014","ph_swift_1510000015","ph_swift_1510000016","ph_swift_1510000017","ph_swift_1510000018","ph_swift_1510000019","ph_swift_1510000020","ph_swift_1510000021","ph_swift_1510000023","ph_swift_1510000024","ph_swift_1510000025","ph_swift_210000001","ph_swift_210000002","ph_swift_210000003","ph_swift_210000004","ph_swift_210000005","ph_swift_210000006","ph_swift_210000007","ph_swift_210000008","ph_swift_210000009","ph_swift_210000010","ph_swift_510100001","ph_swift_510200001","ph_swift_510200002","ph_swift_510301001","ph_swift_510301002","ph_swift_510301003","ph_swift_510302001","ph_swift_510302002","ph_swift_510302003","ph_swift_510303000","ph_swift_510401000","ph_swift_510402001","ph_swift_510402002","ph_swift_510402003","ph_swift_510402004","ph_swift_510402005","ph_swift_510402006","ph_swift_510402007","ph_swift_510500001","ph_swift_510500002","ph_swift_510600001","ph_swift_510600002","ph_swift_510600003","ph_swift_510600004","ph_swift_510700000","ph_swift_510800001","ph_swift_510800002","ph_swift_510900000","ph_swift_511000001","ph_swift_511000002","ph_swift_511100001","ph_swift_511100002","ph_swift_511100003","ph_swift_511200000","ph_swift_511300001","ph_swift_511300002","ph_swift_511300003","ph_swift_511300004","ph_swift_511300005","ph_swift_511300006","ph_swift_511300007","ph_swift_511300008","ph_swift_511400001","ph_swift_511400002","ph_swift_511400003","ph_swift_511400004","ph_swift_511400005","ph_swift_511500001","ph_swift_511500002","ph_swift_511500003","ph_swift_511500004","ph_swift_511600001","ph_swift_511600002","ph_swift_511600003","ph_swift_511700001","ph_swift_511700002","ph_swift_511700003","ph_swift_610000001","ph_swift_610000002","ph_swift_610000003","ph_swift_610000004","ph_swift_610000005","ph_swift_610000006","ph_swift_610000007","ph_swift_710100001","ph_swift_710100002","ph_swift_710100003","ph_swift_710100004","ph_swift_710100006","ph_swift_710100007","ph_swift_710100008","ph_swift_710100009","ph_swift_710200001","ph_swift_710200002","ph_swift_710200003","ph_swift_710200004","ph_swift_710200009","ph_swift_710300001","ph_swift_710300002","ph_swift_710300003","ph_swift_710300004","ph_swift_710300009","ph_swift_710400001","ph_swift_710400002","ph_swift_810101001","ph_swift_810101002","ph_swift_810101003","ph_swift_810101004","ph_swift_810101007","ph_swift_810101008","ph_swift_810101011","ph_swift_810102001","ph_swift_810102002","ph_swift_810102003","ph_swift_810102004","ph_swift_810102005","ph_swift_810102006","ph_swift_810102007","ph_swift_810102008","ph_swift_810102009","ph_swift_810201001","ph_swift_810201002","ph_swift_810201003","ph_swift_810201004","ph_swift_810202001","ph_swift_810202002","ph_swift_810202003","ph_swift_810202005","ph_swift_810202006","ph_swift_910100001","ph_swift_910100002","ph_swift_910100003","ph_swift_910100004","ph_swift_910100005","ph_swift_910100006","ph_swift_910100007","ph_swift_910100009","ph_swift_910100010","ph_swift_910100011","ph_swift_910200001","ph_swift_910200002","ph_swift_910200003","ph_swift_910200004","ph_swift_910200005","ph_swift_910200006","ph_swift_910200007","ph_swift_910200009","ph_swift_910200010","ph_swift_910200011","pk_swift_9009","pk_swift_9010","pk_swift_9011","pk_swift_9012","pk_swift_9013","pk_swift_9014","pk_swift_9015","pk_swift_9016","pk_swift_9017","pk_swift_9018","pk_swift_9019","pk_swift_9020","pk_swift_9021","pk_swift_9022","pk_swift_9023","pk_swift_9024","pk_swift_9025","pk_swift_9026","pk_swift_9027","pk_swift_9028","pk_swift_9029","pk_swift_9030","pk_swift_9031","pk_swift_9032","pk_swift_9033","pk_swift_9041","pk_swift_9051","pk_swift_9052","pk_swift_9061","pk_swift_9071","pk_swift_9072","pk_swift_9073","pk_swift_9081","pk_swift_9082","pk_swift_9083","pk_swift_9084","pk_swift_9085","pk_swift_9086","pk_swift_9091","pk_swift_9092","pk_swift_9101","pk_swift_9102","pk_swift_9111","pk_swift_9121","pk_swift_9122","pk_swift_9124","pk_swift_9141","pk_swift_9146","pk_swift_9151","pk_swift_9152","pk_swift_9161","pk_swift_9171","pk_swift_9172","pk_swift_9173","pk_swift_9174","pk_swift_9181","pk_swift_9182","pk_swift_9183","pk_swift_9184","pk_swift_9185","pk_swift_9186","pk_swift_9191","pk_swift_9192","pk_swift_9193","pk_swift_9201","pk_swift_9202","pk_swift_9211","pk_swift_9212","pk_swift_9221","pk_swift_9222","pk_swift_9230","pk_swift_9231","pk_swift_9232","pk_swift_9233","pk_swift_9234","pk_swift_9235","pk_swift_9236","pk_swift_9237","pk_swift_9238","pk_swift_9239","pk_swift_9241","pk_swift_9242","pk_swift_9243","pk_swift_9244","pk_swift_9247","pk_swift_9248","pk_swift_9249","pk_swift_9250","pk_swift_9251","pk_swift_9261","pk_swift_9262","pk_swift_9271","pk_swift_9272","pk_swift_9273","pk_swift_9281","pk_swift_9291","pk_swift_9301","pk_swift_9302","pk_swift_9303","pk_swift_9311","pk_swift_9312","pk_swift_9322","pk_swift_9323","pk_swift_9324","pk_swift_9331","pk_swift_9332","pk_swift_9333","pk_swift_9341","pk_swift_9351","pk_swift_9361","pk_swift_9381","pk_swift_9391","pk_swift_9401","pk_swift_9412","pk_swift_9414","pk_swift_9421","pk_swift_9422","pk_swift_9423","pk_swift_9426","pk_swift_9431","pk_swift_9432","pk_swift_9433","pk_swift_9434","pk_swift_9435","pk_swift_9441","pk_swift_9442","pk_swift_9443","pk_swift_9444","pk_swift_9445","pk_swift_9448","pk_swift_9451","pk_swift_9452","pk_swift_9453","pk_swift_9454","pk_swift_9455","pk_swift_9456","pk_swift_9457","pk_swift_9458","pk_swift_9459","pk_swift_9461","pk_swift_9462","pk_swift_9463","pk_swift_9468","pk_swift_9469","pk_swift_9470","pk_swift_9471","pk_swift_9472","pk_swift_9473","pk_swift_9474","pk_swift_9475","pk_swift_9476","pk_swift_9477","pk_swift_9478","pk_swift_9479","pk_swift_9481","pk_swift_9482","pk_swift_9483","pk_swift_9484","pk_swift_9491","pk_swift_9492","pk_swift_9493","pk_swift_9494","pk_swift_9501","pk_swift_9502","pk_swift_9503","pk_swift_9521","pk_swift_9522","pk_swift_9523","pk_swift_9524","pk_swift_9525","pk_swift_9526","pk_swift_9527","pk_swift_9528","pk_swift_9529","pk_swift_9530","pk_swift_9531","pk_swift_9532","pk_swift_9533","pk_swift_9534","pk_swift_9535","pk_swift_9536","pk_swift_9537","pk_swift_9538","pk_swift_9539","pk_swift_9541","pk_swift_9542","pk_swift_9543","pk_swift_9544","pk_swift_9545","pk_swift_9546","pk_swift_9547","pk_swift_9548","pk_swift_9549","pk_swift_9551","pk_swift_9552","pk_swift_9553","pk_swift_9554","pk_swift_9555","pk_swift_9556","pk_swift_9561","pk_swift_9562","pk_swift_9563","pk_swift_9564","pk_swift_9565","pk_swift_9566","pk_swift_9572","pk_swift_9573","pk_swift_9574","pk_swift_9582","pk_swift_9583","pk_swift_9584","pk_swift_9592","pk_swift_9593","pk_swift_9594","pk_swift_9595","pk_swift_9596","pk_swift_9597","pk_swift_9602","pk_swift_9605","pk_swift_9606","pk_swift_9607","pk_swift_9608","pk_swift_9609","pk_swift_9612","pk_swift_9613","pk_swift_9614","pk_swift_9622","pk_swift_9623","pk_swift_9624","pk_swift_9625","pk_swift_9637","pk_swift_9638","pk_swift_9641","pk_swift_9642","pk_swift_9643","pk_swift_9644","pk_swift_9645","pk_swift_9646","pk_swift_9647","pk_swift_9648","pk_swift_9649","pk_swift_9650","pk_swift_9651","pk_swift_9652","pk_swift_9653","pk_swift_9654","pk_swift_9668","pk_swift_9669","pk_swift_9673","pk_swift_9674","pk_swift_9675","pk_swift_9676","pk_swift_9677","pk_swift_9678","pk_swift_9681","pk_swift_9682","pk_swift_9693","pk_swift_9694","pk_swift_9695","pk_swift_9697","pk_swift_9698","pk_swift_9699","pk_swift_9703","pk_swift_9707","pk_swift_9708","za_swift_105","za_swift_220","za_swift_231","za_swift_242","za_swift_250","za_swift_251","za_swift_265","za_swift_266","za_swift_275","za_swift_276","za_swift_280","za_swift_285","za_swift_287","za_swift_288","za_swift_289","za_swift_290","za_swift_291","za_swift_296","za_swift_297","za_swift_308","za_swift_401","za_swift_10101","za_swift_10301","za_swift_27201"]},"pix_key":{"type":["string","null"]},"force_cpf_cnpj":{"type":["boolean","null"],"description":"Force CPF/CNPJ validation for PIX key"},"beneficiary_name":{"type":["string","null"],"maxLength":128},"routing_number":{"type":["string","null"]},"account_number":{"type":["string","null"]},"account_type":{"type":["string","null"],"enum":["checking","saving"]},"account_class":{"type":["string","null"],"enum":["individual","business"]},"address_line_1":{"type":["string","null"]},"address_line_2":{"type":["string","null"]},"city":{"type":["string","null"]},"state_province_region":{"type":["string","null"]},"country":{"type":["string","null"],"enum":["AF","AL","DZ","AS","AD","AO","AI","AQ","AG","AR","AM","AW","AU","AT","AZ","BS","BH","BD","BB","BY","BE","BZ","BJ","BM","BT","BO","BQ","BA","BW","BV","BR","IO","BN","BG","BF","BI","CV","KH","CM","CA","KY","CF","TD","CL","CN","CX","CC","CO","KM","CD","CG","CK","CR","HR","CU","CW","CY","CZ","CI","DK","DJ","DM","DO","EC","EG","SV","GQ","ER","EE","SZ","ET","FK","FO","FJ","FI","FR","GF","PF","TF","GA","GM","GE","DE","GH","GI","GR","GL","GD","GP","GU","GT","GG","GN","GW","GY","HT","HM","VA","HN","HK","HU","IS","IN","ID","IR","IQ","IE","IM","IL","IT","JM","JP","JE","JO","KZ","KE","KI","KP","KR","KW","KG","LA","LV","LB","LS","LR","LY","LI","LT","LU","MO","MG","MW","MY","MV","ML","MT","MH","MQ","MR","MU","YT","MX","FM","MD","MC","MN","ME","MS","MA","MZ","MM","NA","NR","NP","NL","NC","NZ","NI","NE","NG","NU","NF","MP","NO","OM","PK","PW","PS","PA","PG","PY","PE","PH","PN","PL","PT","PR","QA","MK","RO","RU","RW","RE","BL","SH","KN","LC","MF","PM","VC","WS","SM","ST","SA","SN","RS","SC","SL","SG","SX","SK","SI","SB","SO","ZA","GS","SS","ES","LK","SD","SR","SJ","SE","CH","SY","TW","TJ","TZ","TH","TL","TG","TK","TO","TT","TN","TR","TM","TC","TV","UG","UA","AE","GB","UM","US","UY","UZ","VU","VE","VN","VG","VI","WF","EH","YE","ZM","ZW","AX"]},"postal_code":{"type":["string","null"]},"checkbook_account_id":{"type":["string","null"]},"checkbook_user_key":{"type":["string","null"]},"onemoney_external_account_id":{"type":["string","null"]},"pix_safe_bank_code":{"type":["string","null"],"pattern":"^\\d{4,8}$"},"pix_safe_branch_code":{"type":["string","null"],"pattern":"^\\d{4}(-\\d)?$"},"pix_safe_cpf_cnpj":{"type":["string","null"]},"ted_bank_code":{"type":["string","null"],"pattern":"^\\d{3,5}$"},"ted_branch_code":{"type":["string","null"],"pattern":"^\\d{4}(-\\d)?$"},"ted_cpf_cnpj":{"type":["string","null"]},"spei_protocol":{"type":["string","null"],"enum":["clabe","debitcard","phonenum"],"description":"For debitcard and phonenum the spei_institution_code is required"},"spei_institution_code":{"type":["string","null"],"minLength":5,"maxLength":5},"spei_clabe":{"type":["string","null"]},"transfers_type":{"type":["string","null"],"enum":["CVU","CBU","ALIAS"]},"transfers_account":{"type":["string","null"]},"ach_cop_beneficiary_first_name":{"type":["string","null"]},"ach_cop_beneficiary_last_name":{"type":["string","null"]},"ach_cop_document_id":{"type":["string","null"]},"ach_cop_document_type":{"type":["string","null"],"enum":["CC","CE","NIT","PASS","PEP"],"description":"CC - Cédula de Ciudadanía; CE - Cédula de Extranjería; NIT - Número de Identificación Tributaria; PASS - Passport; PEP - Permiso Especial de Permanencia"},"ach_cop_email":{"type":["string","null"]},"ach_cop_bank_code":{"type":["string","null"]},"ach_cop_bank_account":{"type":["string","null"]},"swift_code_bic":{"type":["string","null"]},"swift_account_holder_name":{"type":["string","null"],"maxLength":50},"swift_account_number_iban":{"type":["string","null"]},"swift_beneficiary_address_line_1":{"type":["string","null"]},"swift_beneficiary_address_line_2":{"type":["string","null"]},"swift_beneficiary_country":{"type":["string","null"],"enum":["AF","AL","DZ","AS","AD","AO","AI","AQ","AG","AR","AM","AW","AU","AT","AZ","BS","BH","BD","BB","BY","BE","BZ","BJ","BM","BT","BO","BQ","BA","BW","BV","BR","IO","BN","BG","BF","BI","CV","KH","CM","CA","KY","CF","TD","CL","CN","CX","CC","CO","KM","CD","CG","CK","CR","HR","CU","CW","CY","CZ","CI","DK","DJ","DM","DO","EC","EG","SV","GQ","ER","EE","SZ","ET","FK","FO","FJ","FI","FR","GF","PF","TF","GA","GM","GE","DE","GH","GI","GR","GL","GD","GP","GU","GT","GG","GN","GW","GY","HT","HM","VA","HN","HK","HU","IS","IN","ID","IR","IQ","IE","IM","IL","IT","JM","JP","JE","JO","KZ","KE","KI","KP","KR","KW","KG","LA","LV","LB","LS","LR","LY","LI","LT","LU","MO","MG","MW","MY","MV","ML","MT","MH","MQ","MR","MU","YT","MX","FM","MD","MC","MN","ME","MS","MA","MZ","MM","NA","NR","NP","NL","NC","NZ","NI","NE","NG","NU","NF","MP","NO","OM","PK","PW","PS","PA","PG","PY","PE","PH","PN","PL","PT","PR","QA","MK","RO","RU","RW","RE","BL","SH","KN","LC","MF","PM","VC","WS","SM","ST","SA","SN","RS","SC","SL","SG","SX","SK","SI","SB","SO","ZA","GS","SS","ES","LK","SD","SR","SJ","SE","CH","SY","TW","TJ","TZ","TH","TL","TG","TK","TO","TT","TN","TR","TM","TC","TV","UG","UA","AE","GB","UM","US","UY","UZ","VU","VE","VN","VG","VI","WF","EH","YE","ZM","ZW","AX"]},"swift_beneficiary_city":{"type":["string","null"]},"swift_beneficiary_state_province_region":{"type":["string","null"]},"swift_beneficiary_postal_code":{"type":["string","null"]},"swift_bank_name":{"type":["string","null"]},"swift_bank_address_line_1":{"type":["string","null"]},"swift_bank_address_line_2":{"type":["string","null"]},"swift_bank_country":{"type":["string","null"],"enum":["AF","AL","DZ","AS","AD","AO","AI","AQ","AG","AR","AM","AW","AU","AT","AZ","BS","BH","BD","BB","BY","BE","BZ","BJ","BM","BT","BO","BQ","BA","BW","BV","BR","IO","BN","BG","BF","BI","CV","KH","CM","CA","KY","CF","TD","CL","CN","CX","CC","CO","KM","CD","CG","CK","CR","HR","CU","CW","CY","CZ","CI","DK","DJ","DM","DO","EC","EG","SV","GQ","ER","EE","SZ","ET","FK","FO","FJ","FI","FR","GF","PF","TF","GA","GM","GE","DE","GH","GI","GR","GL","GD","GP","GU","GT","GG","GN","GW","GY","HT","HM","VA","HN","HK","HU","IS","IN","ID","IR","IQ","IE","IM","IL","IT","JM","JP","JE","JO","KZ","KE","KI","KP","KR","KW","KG","LA","LV","LB","LS","LR","LY","LI","LT","LU","MO","MG","MW","MY","MV","ML","MT","MH","MQ","MR","MU","YT","MX","FM","MD","MC","MN","ME","MS","MA","MZ","MM","NA","NR","NP","NL","NC","NZ","NI","NE","NG","NU","NF","MP","NO","OM","PK","PW","PS","PA","PG","PY","PE","PH","PN","PL","PT","PR","QA","MK","RO","RU","RW","RE","BL","SH","KN","LC","MF","PM","VC","WS","SM","ST","SA","SN","RS","SC","SL","SG","SX","SK","SI","SB","SO","ZA","GS","SS","ES","LK","SD","SR","SJ","SE","CH","SY","TW","TJ","TZ","TH","TL","TG","TK","TO","TT","TN","TR","TM","TC","TV","UG","UA","AE","GB","UM","US","UY","UZ","VU","VE","VN","VG","VI","WF","EH","YE","ZM","ZW","AX"]},"swift_bank_city":{"type":["string","null"]},"swift_bank_state_province_region":{"type":["string","null"]},"swift_bank_postal_code":{"type":["string","null"]},"swift_ifsc_branch_code":{"type":["string","null"],"pattern":"^[A-Z]{4}0[A-Z0-9]{6}$"},"swift_intermediary_bank_swift_code_bic":{"anyOf":[{"type":"string","minLength":8,"maxLength":8},{"type":"string","minLength":11,"maxLength":11},{"type":"null"}]},"swift_intermediary_bank_account_number_iban":{"type":["string","null"],"maxLength":34},"swift_intermediary_bank_name":{"type":["string","null"]},"swift_intermediary_bank_country":{"type":["string","null"],"enum":["AF","AL","DZ","AS","AD","AO","AI","AQ","AG","AR","AM","AW","AU","AT","AZ","BS","BH","BD","BB","BY","BE","BZ","BJ","BM","BT","BO","BQ","BA","BW","BV","BR","IO","BN","BG","BF","BI","CV","KH","CM","CA","KY","CF","TD","CL","CN","CX","CC","CO","KM","CD","CG","CK","CR","HR","CU","CW","CY","CZ","CI","DK","DJ","DM","DO","EC","EG","SV","GQ","ER","EE","SZ","ET","FK","FO","FJ","FI","FR","GF","PF","TF","GA","GM","GE","DE","GH","GI","GR","GL","GD","GP","GU","GT","GG","GN","GW","GY","HT","HM","VA","HN","HK","HU","IS","IN","ID","IR","IQ","IE","IM","IL","IT","JM","JP","JE","JO","KZ","KE","KI","KP","KR","KW","KG","LA","LV","LB","LS","LR","LY","LI","LT","LU","MO","MG","MW","MY","MV","ML","MT","MH","MQ","MR","MU","YT","MX","FM","MD","MC","MN","ME","MS","MA","MZ","MM","NA","NR","NP","NL","NC","NZ","NI","NE","NG","NU","NF","MP","NO","OM","PK","PW","PS","PA","PG","PY","PE","PH","PN","PL","PT","PR","QA","MK","RO","RU","RW","RE","BL","SH","KN","LC","MF","PM","VC","WS","SM","ST","SA","SN","RS","SC","SL","SG","SX","SK","SI","SB","SO","ZA","GS","SS","ES","LK","SD","SR","SJ","SE","CH","SY","TW","TJ","TZ","TH","TL","TG","TK","TO","TT","TN","TR","TM","TC","TV","UG","UA","AE","GB","UM","US","UY","UZ","VU","VE","VN","VG","VI","WF","EH","YE","ZM","ZW","AX"]},"sepa_iban":{"type":["string","null"]},"sepa_beneficiary_bic":{"type":["string","null"],"description":"BIC/SWIFT code of the beneficiary bank"},"sepa_beneficiary_legal_name":{"type":["string","null"],"maxLength":128},"sepa_beneficiary_address_line_1":{"type":["string","null"]},"sepa_beneficiary_address_line_2":{"type":["string","null"]},"sepa_beneficiary_city":{"type":["string","null"]},"sepa_beneficiary_state_province_region":{"type":["string","null"]},"sepa_beneficiary_postal_code":{"type":["string","null"]},"sepa_beneficiary_country":{"type":["string","null"],"enum":["AF","AL","DZ","AS","AD","AO","AI","AQ","AG","AR","AM","AW","AU","AT","AZ","BS","BH","BD","BB","BY","BE","BZ","BJ","BM","BT","BO","BQ","BA","BW","BV","BR","IO","BN","BG","BF","BI","CV","KH","CM","CA","KY","CF","TD","CL","CN","CX","CC","CO","KM","CD","CG","CK","CR","HR","CU","CW","CY","CZ","CI","DK","DJ","DM","DO","EC","EG","SV","GQ","ER","EE","SZ","ET","FK","FO","FJ","FI","FR","GF","PF","TF","GA","GM","GE","DE","GH","GI","GR","GL","GD","GP","GU","GT","GG","GN","GW","GY","HT","HM","VA","HN","HK","HU","IS","IN","ID","IR","IQ","IE","IM","IL","IT","JM","JP","JE","JO","KZ","KE","KI","KP","KR","KW","KG","LA","LV","LB","LS","LR","LY","LI","LT","LU","MO","MG","MW","MY","MV","ML","MT","MH","MQ","MR","MU","YT","MX","FM","MD","MC","MN","ME","MS","MA","MZ","MM","NA","NR","NP","NL","NC","NZ","NI","NE","NG","NU","NF","MP","NO","OM","PK","PW","PS","PA","PG","PY","PE","PH","PN","PL","PT","PR","QA","MK","RO","RU","RW","RE","BL","SH","KN","LC","MF","PM","VC","WS","SM","ST","SA","SN","RS","SC","SL","SG","SX","SK","SI","SB","SO","ZA","GS","SS","ES","LK","SD","SR","SJ","SE","CH","SY","TW","TJ","TZ","TH","TL","TG","TK","TO","TT","TN","TR","TM","TC","TV","UG","UA","AE","GB","UM","US","UY","UZ","VU","VE","VN","VG","VI","WF","EH","YE","ZM","ZW","AX"]},"business_industry":{"type":["string","null"],"enum":["111998","112120","113310","115114","541211","541810","541430","541715","541930","561422","561311","561612","561740","561730","236115","236220","237310","238210","811111","812111","812112","532111","624410","541922","811210","812199","611110","611310","611410","611710","211120","212114","221310","562111","562920","213112","522110","522210","522320","523150","523940","523999","524113","813110","813211","813219","551112","721110","722511","722513","561510","713110","713210","712110","711110","711211","621111","621210","622110","623110","621511","623220","541940","621399","621910","541110","311421","337121","322220","339920","334210","339930","312130","334111","334118","325412","339112","336110","336390","315990","313110","339910","516120","513130","512250","519130","711410","711510","531110","531120","531130","531190","531210","531311","531312","531320","531390","454110","445110","455110","457110","449210","444110","459210","459120","445320","458110","458210","458310","455219","424210","456110","446120","541511","541512","541519","518210","511210","517111","517112","517410","481111","483111","485210","488510","484121","493110","423430","423690","423110","423830","423840","423510","424690","424990","424410","424480","423940","541611","541618","541330","541990","541214","561499"]},"phone_number":{"type":["string","null"]},"tax_id":{"type":["string","null"],"maxLength":32},"date_of_birth":{"anyOf":[{"type":"string","format":"date-time"},{"type":"string"},{"type":"null"}]}},"required":["type","name"],"description":"Create a new bank account"}},"required":["instance_id","customer_id"]},
    method: "post",
    pathTemplate: "/v1/instances/{instance_id}/customers/{customer_id}/bank-accounts",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"customer_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1InstancesCustomersBankAccountsById", {
    name: "GetV1InstancesCustomersBankAccountsById",
    description: `Retrieve Bank Account`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"customer_id":{"type":"string","minLength":15,"maxLength":15,"description":"Customer ID"},"id":{"type":"string","minLength":15,"maxLength":15}},"required":["instance_id","customer_id","id"]},
    method: "get",
    pathTemplate: "/v1/instances/{instance_id}/customers/{customer_id}/bank-accounts/{id}",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"customer_id","in":"path"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["DeleteV1InstancesCustomersBankAccountsById", {
    name: "DeleteV1InstancesCustomersBankAccountsById",
    description: `Remove Bank Account`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"customer_id":{"type":"string","minLength":15,"maxLength":15,"description":"Customer ID"},"id":{"type":"string","minLength":15,"maxLength":15}},"required":["instance_id","customer_id","id"]},
    method: "delete",
    pathTemplate: "/v1/instances/{instance_id}/customers/{customer_id}/bank-accounts/{id}",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"customer_id","in":"path"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1InstancesCustomersVirtualAccounts", {
    name: "GetV1InstancesCustomersVirtualAccounts",
    description: `Retrieve Virtual Accounts`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"customer_id":{"type":"string","minLength":15,"maxLength":15,"description":"Customer ID"}},"required":["instance_id","customer_id"]},
    method: "get",
    pathTemplate: "/v1/instances/{instance_id}/customers/{customer_id}/virtual-accounts",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"customer_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1InstancesCustomersVirtualAccounts", {
    name: "PostV1InstancesCustomersVirtualAccounts",
    description: `Create Virtual Account`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"customer_id":{"type":"string","minLength":15,"maxLength":15,"description":"Customer ID"},"requestBody":{"type":"object","properties":{"banking_partner":{"type":"string","enum":["jpmorgan","citi","hsbc","cfsb"]},"token":{"type":"string","enum":["USDC","USDT","USDB"]},"blockchain_wallet_id":{"type":"string","minLength":15,"maxLength":15},"sole_proprietor_doc_type":{"type":["string","null"],"enum":["master_service_agreement","salary_slip","bank_statement"]},"sole_proprietor_doc_file":{"type":["string","null"],"format":"uri"}},"required":["banking_partner","token","blockchain_wallet_id"],"description":"Create a new virtual account"}},"required":["instance_id","customer_id"]},
    method: "post",
    pathTemplate: "/v1/instances/{instance_id}/customers/{customer_id}/virtual-accounts",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"customer_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1InstancesCustomersVirtualAccountsById", {
    name: "GetV1InstancesCustomersVirtualAccountsById",
    description: `Retrieve Virtual Account`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"customer_id":{"type":"string","minLength":15,"maxLength":15,"description":"Customer ID"},"id":{"type":"string","minLength":15,"maxLength":15}},"required":["instance_id","customer_id","id"]},
    method: "get",
    pathTemplate: "/v1/instances/{instance_id}/customers/{customer_id}/virtual-accounts/{id}",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"customer_id","in":"path"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PutV1InstancesCustomersVirtualAccountsById", {
    name: "PutV1InstancesCustomersVirtualAccountsById",
    description: `Update Virtual Account`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"customer_id":{"type":"string","minLength":15,"maxLength":15,"description":"Customer ID"},"id":{"type":"string","minLength":15,"maxLength":15},"requestBody":{"type":"object","properties":{"token":{"type":"string","enum":["USDC","USDT","USDB"]},"blockchain_wallet_id":{"type":"string","minLength":15,"maxLength":15}},"required":["token","blockchain_wallet_id"],"description":"Update a virtual account"}},"required":["instance_id","customer_id","id"]},
    method: "put",
    pathTemplate: "/v1/instances/{instance_id}/customers/{customer_id}/virtual-accounts/{id}",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"customer_id","in":"path"},{"name":"id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1InstancesCustomers", {
    name: "GetV1InstancesCustomers",
    description: `Retrieve Customers`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"limit":{"type":"string","enum":["10","50","100","200","500","1000"],"description":"Number of items to return"},"offset":{"type":"string","enum":["0","10","50","100","200","500","1000"],"description":"Number of items to skip"},"starting_after":{"type":"string","description":"A cursor for use in pagination. starting_after is an object ID that defines your place in the list."},"ending_before":{"type":"string","description":"A cursor for use in pagination. ending_before is an object ID that defines your place in the list."},"full_name":{"type":"string"},"receiver_name":{"type":"string"},"customer_name":{"type":"string"},"status":{"type":"string","enum":["verifying","approved","rejected","deprecated","pending_review","awaiting_contract","compliance_request"]},"receiver_id":{"type":"string"},"customer_id":{"type":"string"},"bank_account_id":{"type":"string"},"country":{"type":"string"}},"required":["instance_id"]},
    method: "get",
    pathTemplate: "/v1/instances/{instance_id}/customers",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"limit","in":"query"},{"name":"offset","in":"query"},{"name":"starting_after","in":"query"},{"name":"ending_before","in":"query"},{"name":"full_name","in":"query"},{"name":"receiver_name","in":"query"},{"name":"customer_name","in":"query"},{"name":"status","in":"query"},{"name":"receiver_id","in":"query"},{"name":"customer_id","in":"query"},{"name":"bank_account_id","in":"query"},{"name":"country","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1InstancesCustomers", {
    name: "PostV1InstancesCustomers",
    description: `Create Customer`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"requestBody":{"type":"object","properties":{"type":{"type":"string","enum":["individual","business"]},"kyc_type":{"type":"string","enum":["light","standard","enhanced"]},"email":{"type":"string","format":"email"},"tax_id":{"type":["string","null"]},"address_line_1":{"type":["string","null"]},"address_line_2":{"type":["string","null"]},"city":{"type":["string","null"]},"state_province_region":{"type":["string","null"]},"country":{"type":"string","enum":["AF","AL","DZ","AS","AD","AO","AI","AQ","AG","AR","AM","AW","AU","AT","AZ","BS","BH","BD","BB","BY","BE","BZ","BJ","BM","BT","BO","BQ","BA","BW","BV","BR","IO","BN","BG","BF","BI","CV","KH","CM","CA","KY","CF","TD","CL","CN","CX","CC","CO","KM","CD","CG","CK","CR","HR","CU","CW","CY","CZ","CI","DK","DJ","DM","DO","EC","EG","SV","GQ","ER","EE","SZ","ET","FK","FO","FJ","FI","FR","GF","PF","TF","GA","GM","GE","DE","GH","GI","GR","GL","GD","GP","GU","GT","GG","GN","GW","GY","HT","HM","VA","HN","HK","HU","IS","IN","ID","IR","IQ","IE","IM","IL","IT","JM","JP","JE","JO","KZ","KE","KI","KP","KR","KW","KG","LA","LV","LB","LS","LR","LY","LI","LT","LU","MO","MG","MW","MY","MV","ML","MT","MH","MQ","MR","MU","YT","MX","FM","MD","MC","MN","ME","MS","MA","MZ","MM","NA","NR","NP","NL","NC","NZ","NI","NE","NG","NU","NF","MP","NO","OM","PK","PW","PS","PA","PG","PY","PE","PH","PN","PL","PT","PR","QA","MK","RO","RU","RW","RE","BL","SH","KN","LC","MF","PM","VC","WS","SM","ST","SA","SN","RS","SC","SL","SG","SX","SK","SI","SB","SO","ZA","GS","SS","ES","LK","SD","SR","SJ","SE","CH","SY","TW","TJ","TZ","TH","TL","TG","TK","TO","TT","TN","TR","TM","TC","TV","UG","UA","AE","GB","UM","US","UY","UZ","VU","VE","VN","VG","VI","WF","EH","YE","ZM","ZW","AX"]},"postal_code":{"type":["string","null"]},"ip_address":{"type":["string","null"],"format":"ip"},"image_url":{"type":["string","null"],"format":"uri"},"phone_number":{"type":["string","null"]},"proof_of_address_doc_type":{"type":["string","null"],"enum":["UTILITY_BILL","BANK_STATEMENT","RENTAL_AGREEMENT","TAX_DOCUMENT","GOVERNMENT_CORRESPONDENCE"]},"proof_of_address_doc_file":{"type":["string","null"],"format":"uri","description":"Please upload one document that serve as proof of address, this needs to be the same physical address as the one provided above. Only PDF and image files are accepted (.jpg, .jpeg, .png, .pdf) with a maximum size of 3MB."},"first_name":{"type":["string","null"]},"last_name":{"type":["string","null"]},"date_of_birth":{"anyOf":[{"type":"string","format":"date-time"},{"type":"string"},{"type":"null"}]},"id_doc_country":{"type":["string","null"],"enum":["AF","AL","DZ","AS","AD","AO","AI","AQ","AG","AR","AM","AW","AU","AT","AZ","BS","BH","BD","BB","BY","BE","BZ","BJ","BM","BT","BO","BQ","BA","BW","BV","BR","IO","BN","BG","BF","BI","CV","KH","CM","CA","KY","CF","TD","CL","CN","CX","CC","CO","KM","CD","CG","CK","CR","HR","CU","CW","CY","CZ","CI","DK","DJ","DM","DO","EC","EG","SV","GQ","ER","EE","SZ","ET","FK","FO","FJ","FI","FR","GF","PF","TF","GA","GM","GE","DE","GH","GI","GR","GL","GD","GP","GU","GT","GG","GN","GW","GY","HT","HM","VA","HN","HK","HU","IS","IN","ID","IR","IQ","IE","IM","IL","IT","JM","JP","JE","JO","KZ","KE","KI","KP","KR","KW","KG","LA","LV","LB","LS","LR","LY","LI","LT","LU","MO","MG","MW","MY","MV","ML","MT","MH","MQ","MR","MU","YT","MX","FM","MD","MC","MN","ME","MS","MA","MZ","MM","NA","NR","NP","NL","NC","NZ","NI","NE","NG","NU","NF","MP","NO","OM","PK","PW","PS","PA","PG","PY","PE","PH","PN","PL","PT","PR","QA","MK","RO","RU","RW","RE","BL","SH","KN","LC","MF","PM","VC","WS","SM","ST","SA","SN","RS","SC","SL","SG","SX","SK","SI","SB","SO","ZA","GS","SS","ES","LK","SD","SR","SJ","SE","CH","SY","TW","TJ","TZ","TH","TL","TG","TK","TO","TT","TN","TR","TM","TC","TV","UG","UA","AE","GB","UM","US","UY","UZ","VU","VE","VN","VG","VI","WF","EH","YE","ZM","ZW","AX"]},"id_doc_type":{"type":["string","null"],"enum":["PASSPORT","ID_CARD","DRIVERS"]},"id_doc_front_file":{"type":["string","null"],"format":"uri","description":"Only image files are accepted (.jpg, .jpeg, .png)"},"id_doc_back_file":{"type":["string","null"],"format":"uri","description":"Only image files are accepted (.jpg, .jpeg, .png)"},"legal_name":{"type":["string","null"]},"alternate_name":{"type":["string","null"]},"formation_date":{"anyOf":[{"type":"string","format":"date-time"},{"type":"string"},{"type":"null"}],"format":"date-time"},"website":{"type":["string","null"],"format":"uri"},"owners":{"type":["array","null"],"items":{"type":"object","properties":{"role":{"type":"string","enum":["beneficial_controlling","beneficial_owner","controlling_person"],"description":"A beneficial owner is someone who directly or indirectly owns 25% or more of your business. A controlling person is someone with significant responsibility to control, manage or direct your business (typically a CEO, senior executive officer or equivalent).","example":"beneficial_owner"},"first_name":{"type":"string","minLength":1,"example":"John"},"last_name":{"type":"string","minLength":1,"example":"Doe"},"date_of_birth":{"anyOf":[{"type":"string","format":"date-time"},{"type":"string"}],"example":"1998-01-01T00:00:00Z"},"tax_id":{"type":"string","example":"536804398"},"address_line_1":{"type":"string","example":"738 Plain St"},"address_line_2":{"type":["string","null"],"example":"Building 22"},"city":{"type":"string","example":"Marshfield"},"state_province_region":{"type":"string","example":"MA"},"country":{"type":"string","enum":["AF","AL","DZ","AS","AD","AO","AI","AQ","AG","AR","AM","AW","AU","AT","AZ","BS","BH","BD","BB","BY","BE","BZ","BJ","BM","BT","BO","BQ","BA","BW","BV","BR","IO","BN","BG","BF","BI","CV","KH","CM","CA","KY","CF","TD","CL","CN","CX","CC","CO","KM","CD","CG","CK","CR","HR","CU","CW","CY","CZ","CI","DK","DJ","DM","DO","EC","EG","SV","GQ","ER","EE","SZ","ET","FK","FO","FJ","FI","FR","GF","PF","TF","GA","GM","GE","DE","GH","GI","GR","GL","GD","GP","GU","GT","GG","GN","GW","GY","HT","HM","VA","HN","HK","HU","IS","IN","ID","IR","IQ","IE","IM","IL","IT","JM","JP","JE","JO","KZ","KE","KI","KP","KR","KW","KG","LA","LV","LB","LS","LR","LY","LI","LT","LU","MO","MG","MW","MY","MV","ML","MT","MH","MQ","MR","MU","YT","MX","FM","MD","MC","MN","ME","MS","MA","MZ","MM","NA","NR","NP","NL","NC","NZ","NI","NE","NG","NU","NF","MP","NO","OM","PK","PW","PS","PA","PG","PY","PE","PH","PN","PL","PT","PR","QA","MK","RO","RU","RW","RE","BL","SH","KN","LC","MF","PM","VC","WS","SM","ST","SA","SN","RS","SC","SL","SG","SX","SK","SI","SB","SO","ZA","GS","SS","ES","LK","SD","SR","SJ","SE","CH","SY","TW","TJ","TZ","TH","TL","TG","TK","TO","TT","TN","TR","TM","TC","TV","UG","UA","AE","GB","UM","US","UY","UZ","VU","VE","VN","VG","VI","WF","EH","YE","ZM","ZW","AX"],"example":"US"},"postal_code":{"type":"string","example":"02050"},"id_doc_country":{"type":"string","enum":["AF","AL","DZ","AS","AD","AO","AI","AQ","AG","AR","AM","AW","AU","AT","AZ","BS","BH","BD","BB","BY","BE","BZ","BJ","BM","BT","BO","BQ","BA","BW","BV","BR","IO","BN","BG","BF","BI","CV","KH","CM","CA","KY","CF","TD","CL","CN","CX","CC","CO","KM","CD","CG","CK","CR","HR","CU","CW","CY","CZ","CI","DK","DJ","DM","DO","EC","EG","SV","GQ","ER","EE","SZ","ET","FK","FO","FJ","FI","FR","GF","PF","TF","GA","GM","GE","DE","GH","GI","GR","GL","GD","GP","GU","GT","GG","GN","GW","GY","HT","HM","VA","HN","HK","HU","IS","IN","ID","IR","IQ","IE","IM","IL","IT","JM","JP","JE","JO","KZ","KE","KI","KP","KR","KW","KG","LA","LV","LB","LS","LR","LY","LI","LT","LU","MO","MG","MW","MY","MV","ML","MT","MH","MQ","MR","MU","YT","MX","FM","MD","MC","MN","ME","MS","MA","MZ","MM","NA","NR","NP","NL","NC","NZ","NI","NE","NG","NU","NF","MP","NO","OM","PK","PW","PS","PA","PG","PY","PE","PH","PN","PL","PT","PR","QA","MK","RO","RU","RW","RE","BL","SH","KN","LC","MF","PM","VC","WS","SM","ST","SA","SN","RS","SC","SL","SG","SX","SK","SI","SB","SO","ZA","GS","SS","ES","LK","SD","SR","SJ","SE","CH","SY","TW","TJ","TZ","TH","TL","TG","TK","TO","TT","TN","TR","TM","TC","TV","UG","UA","AE","GB","UM","US","UY","UZ","VU","VE","VN","VG","VI","WF","EH","YE","ZM","ZW","AX"],"example":"BR"},"id_doc_type":{"type":"string","enum":["PASSPORT","ID_CARD","DRIVERS"],"example":"PASSPORT"},"id_doc_front_file":{"type":"string","format":"uri"},"id_doc_back_file":{"type":["string","null"],"format":"uri","description":"Only image files are accepted (.jpg, .jpeg, .png)"},"proof_of_address_doc_type":{"type":["string","null"],"enum":["UTILITY_BILL","BANK_STATEMENT","RENTAL_AGREEMENT","TAX_DOCUMENT","GOVERNMENT_CORRESPONDENCE"],"example":"UTILITY_BILL"},"proof_of_address_doc_file":{"type":["string","null"],"format":"uri","description":"Please upload one document that serve as proof of address, this needs to be the same address as the one provided above. Only PDF and image files are accepted (.jpg, .jpeg, .png, .pdf) with a maximum size of 3MB."},"ownership_percentage":{"type":["integer","null"],"minimum":0,"maximum":100,"description":"Ownership percentage of the beneficial owner (0-100)","example":25},"title":{"type":["string","null"],"maxLength":128,"description":"Job title of the owner","example":"CEO"},"tax_type":{"type":["string","null"],"enum":["SSN","ITIN"],"description":"Tax identifier type. Mandatory when country is US; must be SSN or ITIN.","example":"SSN"}},"required":["role","first_name","last_name","date_of_birth","tax_id","address_line_1","city","state_province_region","country","postal_code","id_doc_country","id_doc_type","id_doc_front_file"]}},"incorporation_doc_file":{"type":["string","null"],"format":"uri","description":"Please upload your articles of incorporation below. The articles of incorporation or a certificate of incorporation usually includes information like the company name, business purpose, number of shares offered, value of shares, etc. Only PDF and image files are accepted (.jpg, .jpeg, .png, .pdf) with a maximum size of 3MB."},"proof_of_ownership_doc_file":{"type":["string","null"],"format":"uri","description":"Please upload your proof of ownership below. This document usually includes information like the shareholders names and percentages. Only PDF and image files are accepted (.jpg, .jpeg, .png, .pdf) with a maximum size of 3MB."},"source_of_funds_doc_type":{"type":["string","null"],"enum":["business_income","gambling_proceeds","gifts","government_benefits","inheritance","investment_loans","pension_retirement","salary","sale_of_assets_real_estate","savings","esops","investment_proceeds","someone_else_funds"]},"source_of_funds_doc_file":{"type":["string","null"],"format":"uri"},"selfie_file":{"type":["string","null"],"format":"uri","description":"Only image files are accepted (.jpg, .jpeg, .png)"},"purpose_of_transactions":{"type":["string","null"],"enum":["business_transactions","charitable_donations","investment_purposes","payments_to_friends_or_family_abroad","personal_or_living_expenses","protect_wealth","purchase_good_and_services","receive_payment_for_freelancing","receive_salary","other"]},"purpose_of_transactions_explanation":{"type":["string","null"]},"account_purpose":{"type":["string","null"],"enum":["charitable_donations","ecommerce_retail_payments","investment_purposes","business_expenses","payments_to_friends_or_family_abroad","personal_or_living_expenses","protect_wealth","purchase_goods_and_services","receive_payments_for_goods_and_services","tax_optimization","third_party_money_transmission","payroll","treasury_management","other"]},"account_purpose_other":{"type":["string","null"],"maxLength":512,"description":"Required when account_purpose is \"other\". Max 512 characters."},"business_type":{"type":["string","null"],"enum":["corporation","llc","partnership","sole_proprietorship","trust","non_profit"]},"business_description":{"type":["string","null"],"maxLength":512},"business_industry":{"type":["string","null"],"enum":["111998","112120","113310","115114","541211","541810","541430","541715","541930","561422","561311","561612","561740","561730","236115","236220","237310","238210","811111","812111","812112","532111","624410","541922","811210","812199","611110","611310","611410","611710","211120","212114","221310","562111","562920","213112","522110","522210","522320","523150","523940","523999","524113","813110","813211","813219","551112","721110","722511","722513","561510","713110","713210","712110","711110","711211","621111","621210","622110","623110","621511","623220","541940","621399","621910","541110","311421","337121","322220","339920","334210","339930","312130","334111","334118","325412","339112","336110","336390","315990","313110","339910","516120","513130","512250","519130","711410","711510","531110","531120","531130","531190","531210","531311","531312","531320","531390","454110","445110","455110","457110","449210","444110","459210","459120","445320","458110","458210","458310","455219","424210","456110","446120","541511","541512","541519","518210","511210","517111","517112","517410","481111","483111","485210","488510","484121","493110","423430","423690","423110","423830","423840","423510","424690","424990","424410","424480","423940","541611","541618","541330","541990","541214","561499"]},"estimated_annual_revenue":{"type":["string","null"],"enum":["0_99999","100000_999999","1000000_9999999","10000000_49999999","50000000_249999999","250000000_plus"]},"source_of_wealth":{"type":["string","null"],"enum":["business_dividends_or_profits","investments","asset_sales","client_investor_contributions","gambling","charitable_contributions","inheritance","affiliate_or_royalty_income"]},"publicly_traded":{"type":["boolean","null"]},"occupation":{"type":["string","null"],"maxLength":255},"external_id":{"type":["string","null"]},"tos_id":{"type":["string","null"],"minLength":15,"maxLength":15},"additional_info":{"type":["array","null"],"items":{"type":"object","properties":{"label":{"type":"string","enum":["EIN_LETTER","KYC_PROVIDER_DOCUMENT","FLOW_OF_FUNDS","BANK_STATEMENT","TAX_RETURN","AUDITED_FINANCIALS","OPERATING_AGREEMENT","BOARD_RESOLUTION","CERTIFICATE_OF_GOOD_STANDING","BUSINESS_LICENSE","MSB_LICENSE","POWER_OF_ATTORNEY","TRUST_DEED","SHAREHOLDER_REGISTRY","BENEFICIAL_OWNER_DECLARATION","COMPLIANCE_QUESTIONNAIRE","PROOF_OF_EMPLOYMENT","REFERENCE_LETTER","OTHER"]},"value":{"type":"string","minLength":1}},"required":["label","value"],"example":{"label":"EIN_LETTER","value":"https://example.com/ein.pdf"}},"description":"Optional extra documents or notes for this receiver. `label` is a known category, `value` is either a URL to upload or a free-text description. Any URLs are downloaded and re-hosted on Blindpay storage before being stored."}},"required":["type","kyc_type","email","country"],"description":"Create a new customer"}},"required":["instance_id"]},
    method: "post",
    pathTemplate: "/v1/instances/{instance_id}/customers",
    executionParameters: [{"name":"instance_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1EInstancesCustomers", {
    name: "PostV1EInstancesCustomers",
    description: `Create Customer`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"token":{"type":"string"},"requestBody":{"type":"object","properties":{"type":{"type":"string","enum":["individual","business"]},"kyc_type":{"type":"string","enum":["light","standard","enhanced"]},"email":{"type":"string","format":"email"},"tax_id":{"type":["string","null"]},"address_line_1":{"type":["string","null"]},"address_line_2":{"type":["string","null"]},"city":{"type":["string","null"]},"state_province_region":{"type":["string","null"]},"country":{"type":"string","enum":["AF","AL","DZ","AS","AD","AO","AI","AQ","AG","AR","AM","AW","AU","AT","AZ","BS","BH","BD","BB","BY","BE","BZ","BJ","BM","BT","BO","BQ","BA","BW","BV","BR","IO","BN","BG","BF","BI","CV","KH","CM","CA","KY","CF","TD","CL","CN","CX","CC","CO","KM","CD","CG","CK","CR","HR","CU","CW","CY","CZ","CI","DK","DJ","DM","DO","EC","EG","SV","GQ","ER","EE","SZ","ET","FK","FO","FJ","FI","FR","GF","PF","TF","GA","GM","GE","DE","GH","GI","GR","GL","GD","GP","GU","GT","GG","GN","GW","GY","HT","HM","VA","HN","HK","HU","IS","IN","ID","IR","IQ","IE","IM","IL","IT","JM","JP","JE","JO","KZ","KE","KI","KP","KR","KW","KG","LA","LV","LB","LS","LR","LY","LI","LT","LU","MO","MG","MW","MY","MV","ML","MT","MH","MQ","MR","MU","YT","MX","FM","MD","MC","MN","ME","MS","MA","MZ","MM","NA","NR","NP","NL","NC","NZ","NI","NE","NG","NU","NF","MP","NO","OM","PK","PW","PS","PA","PG","PY","PE","PH","PN","PL","PT","PR","QA","MK","RO","RU","RW","RE","BL","SH","KN","LC","MF","PM","VC","WS","SM","ST","SA","SN","RS","SC","SL","SG","SX","SK","SI","SB","SO","ZA","GS","SS","ES","LK","SD","SR","SJ","SE","CH","SY","TW","TJ","TZ","TH","TL","TG","TK","TO","TT","TN","TR","TM","TC","TV","UG","UA","AE","GB","UM","US","UY","UZ","VU","VE","VN","VG","VI","WF","EH","YE","ZM","ZW","AX"]},"postal_code":{"type":["string","null"]},"ip_address":{"type":["string","null"],"format":"ip"},"image_url":{"type":["string","null"],"format":"uri"},"phone_number":{"type":["string","null"]},"proof_of_address_doc_type":{"type":["string","null"],"enum":["UTILITY_BILL","BANK_STATEMENT","RENTAL_AGREEMENT","TAX_DOCUMENT","GOVERNMENT_CORRESPONDENCE"]},"proof_of_address_doc_file":{"type":["string","null"],"format":"uri","description":"Please upload one document that serve as proof of address, this needs to be the same physical address as the one provided above. Only PDF and image files are accepted (.jpg, .jpeg, .png, .pdf) with a maximum size of 3MB."},"first_name":{"type":["string","null"]},"last_name":{"type":["string","null"]},"date_of_birth":{"anyOf":[{"type":"string","format":"date-time"},{"type":"string"},{"type":"null"}]},"id_doc_country":{"type":["string","null"],"enum":["AF","AL","DZ","AS","AD","AO","AI","AQ","AG","AR","AM","AW","AU","AT","AZ","BS","BH","BD","BB","BY","BE","BZ","BJ","BM","BT","BO","BQ","BA","BW","BV","BR","IO","BN","BG","BF","BI","CV","KH","CM","CA","KY","CF","TD","CL","CN","CX","CC","CO","KM","CD","CG","CK","CR","HR","CU","CW","CY","CZ","CI","DK","DJ","DM","DO","EC","EG","SV","GQ","ER","EE","SZ","ET","FK","FO","FJ","FI","FR","GF","PF","TF","GA","GM","GE","DE","GH","GI","GR","GL","GD","GP","GU","GT","GG","GN","GW","GY","HT","HM","VA","HN","HK","HU","IS","IN","ID","IR","IQ","IE","IM","IL","IT","JM","JP","JE","JO","KZ","KE","KI","KP","KR","KW","KG","LA","LV","LB","LS","LR","LY","LI","LT","LU","MO","MG","MW","MY","MV","ML","MT","MH","MQ","MR","MU","YT","MX","FM","MD","MC","MN","ME","MS","MA","MZ","MM","NA","NR","NP","NL","NC","NZ","NI","NE","NG","NU","NF","MP","NO","OM","PK","PW","PS","PA","PG","PY","PE","PH","PN","PL","PT","PR","QA","MK","RO","RU","RW","RE","BL","SH","KN","LC","MF","PM","VC","WS","SM","ST","SA","SN","RS","SC","SL","SG","SX","SK","SI","SB","SO","ZA","GS","SS","ES","LK","SD","SR","SJ","SE","CH","SY","TW","TJ","TZ","TH","TL","TG","TK","TO","TT","TN","TR","TM","TC","TV","UG","UA","AE","GB","UM","US","UY","UZ","VU","VE","VN","VG","VI","WF","EH","YE","ZM","ZW","AX"]},"id_doc_type":{"type":["string","null"],"enum":["PASSPORT","ID_CARD","DRIVERS"]},"id_doc_front_file":{"type":["string","null"],"format":"uri","description":"Only image files are accepted (.jpg, .jpeg, .png)"},"id_doc_back_file":{"type":["string","null"],"format":"uri","description":"Only image files are accepted (.jpg, .jpeg, .png)"},"legal_name":{"type":["string","null"]},"alternate_name":{"type":["string","null"]},"formation_date":{"anyOf":[{"type":"string","format":"date-time"},{"type":"string"},{"type":"null"}],"format":"date-time"},"website":{"type":["string","null"],"format":"uri"},"owners":{"type":["array","null"],"items":{"type":"object","properties":{"role":{"type":"string","enum":["beneficial_controlling","beneficial_owner","controlling_person"],"description":"A beneficial owner is someone who directly or indirectly owns 25% or more of your business. A controlling person is someone with significant responsibility to control, manage or direct your business (typically a CEO, senior executive officer or equivalent).","example":"beneficial_owner"},"first_name":{"type":"string","minLength":1,"example":"John"},"last_name":{"type":"string","minLength":1,"example":"Doe"},"date_of_birth":{"anyOf":[{"type":"string","format":"date-time"},{"type":"string"}],"example":"1998-01-01T00:00:00Z"},"tax_id":{"type":"string","example":"536804398"},"address_line_1":{"type":"string","example":"738 Plain St"},"address_line_2":{"type":["string","null"],"example":"Building 22"},"city":{"type":"string","example":"Marshfield"},"state_province_region":{"type":"string","example":"MA"},"country":{"type":"string","enum":["AF","AL","DZ","AS","AD","AO","AI","AQ","AG","AR","AM","AW","AU","AT","AZ","BS","BH","BD","BB","BY","BE","BZ","BJ","BM","BT","BO","BQ","BA","BW","BV","BR","IO","BN","BG","BF","BI","CV","KH","CM","CA","KY","CF","TD","CL","CN","CX","CC","CO","KM","CD","CG","CK","CR","HR","CU","CW","CY","CZ","CI","DK","DJ","DM","DO","EC","EG","SV","GQ","ER","EE","SZ","ET","FK","FO","FJ","FI","FR","GF","PF","TF","GA","GM","GE","DE","GH","GI","GR","GL","GD","GP","GU","GT","GG","GN","GW","GY","HT","HM","VA","HN","HK","HU","IS","IN","ID","IR","IQ","IE","IM","IL","IT","JM","JP","JE","JO","KZ","KE","KI","KP","KR","KW","KG","LA","LV","LB","LS","LR","LY","LI","LT","LU","MO","MG","MW","MY","MV","ML","MT","MH","MQ","MR","MU","YT","MX","FM","MD","MC","MN","ME","MS","MA","MZ","MM","NA","NR","NP","NL","NC","NZ","NI","NE","NG","NU","NF","MP","NO","OM","PK","PW","PS","PA","PG","PY","PE","PH","PN","PL","PT","PR","QA","MK","RO","RU","RW","RE","BL","SH","KN","LC","MF","PM","VC","WS","SM","ST","SA","SN","RS","SC","SL","SG","SX","SK","SI","SB","SO","ZA","GS","SS","ES","LK","SD","SR","SJ","SE","CH","SY","TW","TJ","TZ","TH","TL","TG","TK","TO","TT","TN","TR","TM","TC","TV","UG","UA","AE","GB","UM","US","UY","UZ","VU","VE","VN","VG","VI","WF","EH","YE","ZM","ZW","AX"],"example":"US"},"postal_code":{"type":"string","example":"02050"},"id_doc_country":{"type":"string","enum":["AF","AL","DZ","AS","AD","AO","AI","AQ","AG","AR","AM","AW","AU","AT","AZ","BS","BH","BD","BB","BY","BE","BZ","BJ","BM","BT","BO","BQ","BA","BW","BV","BR","IO","BN","BG","BF","BI","CV","KH","CM","CA","KY","CF","TD","CL","CN","CX","CC","CO","KM","CD","CG","CK","CR","HR","CU","CW","CY","CZ","CI","DK","DJ","DM","DO","EC","EG","SV","GQ","ER","EE","SZ","ET","FK","FO","FJ","FI","FR","GF","PF","TF","GA","GM","GE","DE","GH","GI","GR","GL","GD","GP","GU","GT","GG","GN","GW","GY","HT","HM","VA","HN","HK","HU","IS","IN","ID","IR","IQ","IE","IM","IL","IT","JM","JP","JE","JO","KZ","KE","KI","KP","KR","KW","KG","LA","LV","LB","LS","LR","LY","LI","LT","LU","MO","MG","MW","MY","MV","ML","MT","MH","MQ","MR","MU","YT","MX","FM","MD","MC","MN","ME","MS","MA","MZ","MM","NA","NR","NP","NL","NC","NZ","NI","NE","NG","NU","NF","MP","NO","OM","PK","PW","PS","PA","PG","PY","PE","PH","PN","PL","PT","PR","QA","MK","RO","RU","RW","RE","BL","SH","KN","LC","MF","PM","VC","WS","SM","ST","SA","SN","RS","SC","SL","SG","SX","SK","SI","SB","SO","ZA","GS","SS","ES","LK","SD","SR","SJ","SE","CH","SY","TW","TJ","TZ","TH","TL","TG","TK","TO","TT","TN","TR","TM","TC","TV","UG","UA","AE","GB","UM","US","UY","UZ","VU","VE","VN","VG","VI","WF","EH","YE","ZM","ZW","AX"],"example":"BR"},"id_doc_type":{"type":"string","enum":["PASSPORT","ID_CARD","DRIVERS"],"example":"PASSPORT"},"id_doc_front_file":{"type":"string","format":"uri"},"id_doc_back_file":{"type":["string","null"],"format":"uri","description":"Only image files are accepted (.jpg, .jpeg, .png)"},"proof_of_address_doc_type":{"type":["string","null"],"enum":["UTILITY_BILL","BANK_STATEMENT","RENTAL_AGREEMENT","TAX_DOCUMENT","GOVERNMENT_CORRESPONDENCE"],"example":"UTILITY_BILL"},"proof_of_address_doc_file":{"type":["string","null"],"format":"uri","description":"Please upload one document that serve as proof of address, this needs to be the same address as the one provided above. Only PDF and image files are accepted (.jpg, .jpeg, .png, .pdf) with a maximum size of 3MB."},"ownership_percentage":{"type":["integer","null"],"minimum":0,"maximum":100,"description":"Ownership percentage of the beneficial owner (0-100)","example":25},"title":{"type":["string","null"],"maxLength":128,"description":"Job title of the owner","example":"CEO"},"tax_type":{"type":["string","null"],"enum":["SSN","ITIN"],"description":"Tax identifier type. Mandatory when country is US; must be SSN or ITIN.","example":"SSN"}},"required":["role","first_name","last_name","date_of_birth","tax_id","address_line_1","city","state_province_region","country","postal_code","id_doc_country","id_doc_type","id_doc_front_file"]}},"incorporation_doc_file":{"type":["string","null"],"format":"uri","description":"Please upload your articles of incorporation below. The articles of incorporation or a certificate of incorporation usually includes information like the company name, business purpose, number of shares offered, value of shares, etc. Only PDF and image files are accepted (.jpg, .jpeg, .png, .pdf) with a maximum size of 3MB."},"proof_of_ownership_doc_file":{"type":["string","null"],"format":"uri","description":"Please upload your proof of ownership below. This document usually includes information like the shareholders names and percentages. Only PDF and image files are accepted (.jpg, .jpeg, .png, .pdf) with a maximum size of 3MB."},"source_of_funds_doc_type":{"type":["string","null"],"enum":["business_income","gambling_proceeds","gifts","government_benefits","inheritance","investment_loans","pension_retirement","salary","sale_of_assets_real_estate","savings","esops","investment_proceeds","someone_else_funds"]},"source_of_funds_doc_file":{"type":["string","null"],"format":"uri"},"selfie_file":{"type":["string","null"],"format":"uri","description":"Only image files are accepted (.jpg, .jpeg, .png)"},"purpose_of_transactions":{"type":["string","null"],"enum":["business_transactions","charitable_donations","investment_purposes","payments_to_friends_or_family_abroad","personal_or_living_expenses","protect_wealth","purchase_good_and_services","receive_payment_for_freelancing","receive_salary","other"]},"purpose_of_transactions_explanation":{"type":["string","null"]},"account_purpose":{"type":["string","null"],"enum":["charitable_donations","ecommerce_retail_payments","investment_purposes","business_expenses","payments_to_friends_or_family_abroad","personal_or_living_expenses","protect_wealth","purchase_goods_and_services","receive_payments_for_goods_and_services","tax_optimization","third_party_money_transmission","payroll","treasury_management","other"]},"account_purpose_other":{"type":["string","null"],"maxLength":512,"description":"Required when account_purpose is \"other\". Max 512 characters."},"business_type":{"type":["string","null"],"enum":["corporation","llc","partnership","sole_proprietorship","trust","non_profit"]},"business_description":{"type":["string","null"],"maxLength":512},"business_industry":{"type":["string","null"],"enum":["111998","112120","113310","115114","541211","541810","541430","541715","541930","561422","561311","561612","561740","561730","236115","236220","237310","238210","811111","812111","812112","532111","624410","541922","811210","812199","611110","611310","611410","611710","211120","212114","221310","562111","562920","213112","522110","522210","522320","523150","523940","523999","524113","813110","813211","813219","551112","721110","722511","722513","561510","713110","713210","712110","711110","711211","621111","621210","622110","623110","621511","623220","541940","621399","621910","541110","311421","337121","322220","339920","334210","339930","312130","334111","334118","325412","339112","336110","336390","315990","313110","339910","516120","513130","512250","519130","711410","711510","531110","531120","531130","531190","531210","531311","531312","531320","531390","454110","445110","455110","457110","449210","444110","459210","459120","445320","458110","458210","458310","455219","424210","456110","446120","541511","541512","541519","518210","511210","517111","517112","517410","481111","483111","485210","488510","484121","493110","423430","423690","423110","423830","423840","423510","424690","424990","424410","424480","423940","541611","541618","541330","541990","541214","561499"]},"estimated_annual_revenue":{"type":["string","null"],"enum":["0_99999","100000_999999","1000000_9999999","10000000_49999999","50000000_249999999","250000000_plus"]},"source_of_wealth":{"type":["string","null"],"enum":["business_dividends_or_profits","investments","asset_sales","client_investor_contributions","gambling","charitable_contributions","inheritance","affiliate_or_royalty_income"]},"publicly_traded":{"type":["boolean","null"]},"occupation":{"type":["string","null"],"maxLength":255},"external_id":{"type":["string","null"]},"tos_id":{"type":["string","null"],"minLength":15,"maxLength":15},"additional_info":{"type":["array","null"],"items":{"type":"object","properties":{"label":{"type":"string","enum":["EIN_LETTER","KYC_PROVIDER_DOCUMENT","FLOW_OF_FUNDS","BANK_STATEMENT","TAX_RETURN","AUDITED_FINANCIALS","OPERATING_AGREEMENT","BOARD_RESOLUTION","CERTIFICATE_OF_GOOD_STANDING","BUSINESS_LICENSE","MSB_LICENSE","POWER_OF_ATTORNEY","TRUST_DEED","SHAREHOLDER_REGISTRY","BENEFICIAL_OWNER_DECLARATION","COMPLIANCE_QUESTIONNAIRE","PROOF_OF_EMPLOYMENT","REFERENCE_LETTER","OTHER"]},"value":{"type":"string","minLength":1}},"required":["label","value"],"example":{"label":"EIN_LETTER","value":"https://example.com/ein.pdf"}},"description":"Optional extra documents or notes for this receiver. `label` is a known category, `value` is either a URL to upload or a free-text description. Any URLs are downloaded and re-hosted on Blindpay storage before being stored."}},"required":["type","kyc_type","email","country"],"description":"Create a new customer"}},"required":["instance_id","token"]},
    method: "post",
    pathTemplate: "/v1/e/instances/{instance_id}/customers",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"token","in":"query"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1InstancesCustomersById", {
    name: "GetV1InstancesCustomersById",
    description: `Retrieve Customer`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"id":{"type":"string","minLength":15,"maxLength":15}},"required":["instance_id","id"]},
    method: "get",
    pathTemplate: "/v1/instances/{instance_id}/customers/{id}",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PutV1InstancesCustomersById", {
    name: "PutV1InstancesCustomersById",
    description: `Update Customer`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"id":{"type":"string","minLength":15,"maxLength":15},"requestBody":{"type":"object","properties":{"email":{"type":"string","format":"email"},"tax_id":{"type":["string","null"]},"address_line_1":{"type":["string","null"]},"address_line_2":{"type":["string","null"]},"city":{"type":["string","null"]},"state_province_region":{"type":["string","null"]},"country":{"type":"string","enum":["AF","AL","DZ","AS","AD","AO","AI","AQ","AG","AR","AM","AW","AU","AT","AZ","BS","BH","BD","BB","BY","BE","BZ","BJ","BM","BT","BO","BQ","BA","BW","BV","BR","IO","BN","BG","BF","BI","CV","KH","CM","CA","KY","CF","TD","CL","CN","CX","CC","CO","KM","CD","CG","CK","CR","HR","CU","CW","CY","CZ","CI","DK","DJ","DM","DO","EC","EG","SV","GQ","ER","EE","SZ","ET","FK","FO","FJ","FI","FR","GF","PF","TF","GA","GM","GE","DE","GH","GI","GR","GL","GD","GP","GU","GT","GG","GN","GW","GY","HT","HM","VA","HN","HK","HU","IS","IN","ID","IR","IQ","IE","IM","IL","IT","JM","JP","JE","JO","KZ","KE","KI","KP","KR","KW","KG","LA","LV","LB","LS","LR","LY","LI","LT","LU","MO","MG","MW","MY","MV","ML","MT","MH","MQ","MR","MU","YT","MX","FM","MD","MC","MN","ME","MS","MA","MZ","MM","NA","NR","NP","NL","NC","NZ","NI","NE","NG","NU","NF","MP","NO","OM","PK","PW","PS","PA","PG","PY","PE","PH","PN","PL","PT","PR","QA","MK","RO","RU","RW","RE","BL","SH","KN","LC","MF","PM","VC","WS","SM","ST","SA","SN","RS","SC","SL","SG","SX","SK","SI","SB","SO","ZA","GS","SS","ES","LK","SD","SR","SJ","SE","CH","SY","TW","TJ","TZ","TH","TL","TG","TK","TO","TT","TN","TR","TM","TC","TV","UG","UA","AE","GB","UM","US","UY","UZ","VU","VE","VN","VG","VI","WF","EH","YE","ZM","ZW","AX"]},"postal_code":{"type":["string","null"]},"ip_address":{"type":["string","null"],"format":"ip"},"image_url":{"type":["string","null"],"format":"uri"},"phone_number":{"type":["string","null"]},"proof_of_address_doc_type":{"type":["string","null"],"enum":["UTILITY_BILL","BANK_STATEMENT","RENTAL_AGREEMENT","TAX_DOCUMENT","GOVERNMENT_CORRESPONDENCE"]},"proof_of_address_doc_file":{"type":["string","null"],"format":"uri","description":"Please upload one document that serve as proof of address, this needs to be the same physical address as the one provided above. Only PDF and image files are accepted (.jpg, .jpeg, .png, .pdf) with a maximum size of 3MB."},"first_name":{"type":["string","null"]},"last_name":{"type":["string","null"]},"date_of_birth":{"anyOf":[{"type":"string","format":"date-time"},{"type":"string"},{"type":"null"}]},"id_doc_country":{"type":["string","null"],"enum":["AF","AL","DZ","AS","AD","AO","AI","AQ","AG","AR","AM","AW","AU","AT","AZ","BS","BH","BD","BB","BY","BE","BZ","BJ","BM","BT","BO","BQ","BA","BW","BV","BR","IO","BN","BG","BF","BI","CV","KH","CM","CA","KY","CF","TD","CL","CN","CX","CC","CO","KM","CD","CG","CK","CR","HR","CU","CW","CY","CZ","CI","DK","DJ","DM","DO","EC","EG","SV","GQ","ER","EE","SZ","ET","FK","FO","FJ","FI","FR","GF","PF","TF","GA","GM","GE","DE","GH","GI","GR","GL","GD","GP","GU","GT","GG","GN","GW","GY","HT","HM","VA","HN","HK","HU","IS","IN","ID","IR","IQ","IE","IM","IL","IT","JM","JP","JE","JO","KZ","KE","KI","KP","KR","KW","KG","LA","LV","LB","LS","LR","LY","LI","LT","LU","MO","MG","MW","MY","MV","ML","MT","MH","MQ","MR","MU","YT","MX","FM","MD","MC","MN","ME","MS","MA","MZ","MM","NA","NR","NP","NL","NC","NZ","NI","NE","NG","NU","NF","MP","NO","OM","PK","PW","PS","PA","PG","PY","PE","PH","PN","PL","PT","PR","QA","MK","RO","RU","RW","RE","BL","SH","KN","LC","MF","PM","VC","WS","SM","ST","SA","SN","RS","SC","SL","SG","SX","SK","SI","SB","SO","ZA","GS","SS","ES","LK","SD","SR","SJ","SE","CH","SY","TW","TJ","TZ","TH","TL","TG","TK","TO","TT","TN","TR","TM","TC","TV","UG","UA","AE","GB","UM","US","UY","UZ","VU","VE","VN","VG","VI","WF","EH","YE","ZM","ZW","AX"]},"id_doc_type":{"type":["string","null"],"enum":["PASSPORT","ID_CARD","DRIVERS"]},"id_doc_front_file":{"type":["string","null"],"format":"uri","description":"Only image files are accepted (.jpg, .jpeg, .png)"},"id_doc_back_file":{"type":["string","null"],"format":"uri","description":"Only image files are accepted (.jpg, .jpeg, .png)"},"legal_name":{"type":["string","null"]},"alternate_name":{"type":["string","null"]},"formation_date":{"anyOf":[{"type":"string","format":"date-time"},{"type":"string"},{"type":"null"}],"format":"date-time"},"website":{"type":["string","null"],"format":"uri"},"owners":{"type":["array","null"],"items":{"type":"object","properties":{"role":{"type":"string","enum":["beneficial_controlling","beneficial_owner","controlling_person"],"description":"A beneficial owner is someone who directly or indirectly owns 25% or more of your business. A controlling person is someone with significant responsibility to control, manage or direct your business (typically a CEO, senior executive officer or equivalent).","example":"beneficial_owner"},"first_name":{"type":"string","minLength":1,"example":"John"},"last_name":{"type":"string","minLength":1,"example":"Doe"},"date_of_birth":{"anyOf":[{"type":"string","format":"date-time"},{"type":"string"}],"example":"1998-01-01T00:00:00Z"},"tax_id":{"type":"string","example":"536804398"},"address_line_1":{"type":"string","example":"738 Plain St"},"address_line_2":{"type":["string","null"],"example":"Building 22"},"city":{"type":"string","example":"Marshfield"},"state_province_region":{"type":"string","example":"MA"},"country":{"type":"string","enum":["AF","AL","DZ","AS","AD","AO","AI","AQ","AG","AR","AM","AW","AU","AT","AZ","BS","BH","BD","BB","BY","BE","BZ","BJ","BM","BT","BO","BQ","BA","BW","BV","BR","IO","BN","BG","BF","BI","CV","KH","CM","CA","KY","CF","TD","CL","CN","CX","CC","CO","KM","CD","CG","CK","CR","HR","CU","CW","CY","CZ","CI","DK","DJ","DM","DO","EC","EG","SV","GQ","ER","EE","SZ","ET","FK","FO","FJ","FI","FR","GF","PF","TF","GA","GM","GE","DE","GH","GI","GR","GL","GD","GP","GU","GT","GG","GN","GW","GY","HT","HM","VA","HN","HK","HU","IS","IN","ID","IR","IQ","IE","IM","IL","IT","JM","JP","JE","JO","KZ","KE","KI","KP","KR","KW","KG","LA","LV","LB","LS","LR","LY","LI","LT","LU","MO","MG","MW","MY","MV","ML","MT","MH","MQ","MR","MU","YT","MX","FM","MD","MC","MN","ME","MS","MA","MZ","MM","NA","NR","NP","NL","NC","NZ","NI","NE","NG","NU","NF","MP","NO","OM","PK","PW","PS","PA","PG","PY","PE","PH","PN","PL","PT","PR","QA","MK","RO","RU","RW","RE","BL","SH","KN","LC","MF","PM","VC","WS","SM","ST","SA","SN","RS","SC","SL","SG","SX","SK","SI","SB","SO","ZA","GS","SS","ES","LK","SD","SR","SJ","SE","CH","SY","TW","TJ","TZ","TH","TL","TG","TK","TO","TT","TN","TR","TM","TC","TV","UG","UA","AE","GB","UM","US","UY","UZ","VU","VE","VN","VG","VI","WF","EH","YE","ZM","ZW","AX"],"example":"US"},"postal_code":{"type":"string","example":"02050"},"id_doc_country":{"type":"string","enum":["AF","AL","DZ","AS","AD","AO","AI","AQ","AG","AR","AM","AW","AU","AT","AZ","BS","BH","BD","BB","BY","BE","BZ","BJ","BM","BT","BO","BQ","BA","BW","BV","BR","IO","BN","BG","BF","BI","CV","KH","CM","CA","KY","CF","TD","CL","CN","CX","CC","CO","KM","CD","CG","CK","CR","HR","CU","CW","CY","CZ","CI","DK","DJ","DM","DO","EC","EG","SV","GQ","ER","EE","SZ","ET","FK","FO","FJ","FI","FR","GF","PF","TF","GA","GM","GE","DE","GH","GI","GR","GL","GD","GP","GU","GT","GG","GN","GW","GY","HT","HM","VA","HN","HK","HU","IS","IN","ID","IR","IQ","IE","IM","IL","IT","JM","JP","JE","JO","KZ","KE","KI","KP","KR","KW","KG","LA","LV","LB","LS","LR","LY","LI","LT","LU","MO","MG","MW","MY","MV","ML","MT","MH","MQ","MR","MU","YT","MX","FM","MD","MC","MN","ME","MS","MA","MZ","MM","NA","NR","NP","NL","NC","NZ","NI","NE","NG","NU","NF","MP","NO","OM","PK","PW","PS","PA","PG","PY","PE","PH","PN","PL","PT","PR","QA","MK","RO","RU","RW","RE","BL","SH","KN","LC","MF","PM","VC","WS","SM","ST","SA","SN","RS","SC","SL","SG","SX","SK","SI","SB","SO","ZA","GS","SS","ES","LK","SD","SR","SJ","SE","CH","SY","TW","TJ","TZ","TH","TL","TG","TK","TO","TT","TN","TR","TM","TC","TV","UG","UA","AE","GB","UM","US","UY","UZ","VU","VE","VN","VG","VI","WF","EH","YE","ZM","ZW","AX"],"example":"BR"},"id_doc_type":{"type":"string","enum":["PASSPORT","ID_CARD","DRIVERS"],"example":"PASSPORT"},"id_doc_front_file":{"type":"string","format":"uri"},"id_doc_back_file":{"type":["string","null"],"format":"uri","description":"Only image files are accepted (.jpg, .jpeg, .png)"},"proof_of_address_doc_type":{"type":["string","null"],"enum":["UTILITY_BILL","BANK_STATEMENT","RENTAL_AGREEMENT","TAX_DOCUMENT","GOVERNMENT_CORRESPONDENCE"],"example":"UTILITY_BILL"},"proof_of_address_doc_file":{"type":["string","null"],"format":"uri","description":"Please upload one document that serve as proof of address, this needs to be the same address as the one provided above. Only PDF and image files are accepted (.jpg, .jpeg, .png, .pdf) with a maximum size of 3MB."},"ownership_percentage":{"type":["integer","null"],"minimum":0,"maximum":100,"description":"Ownership percentage of the beneficial owner (0-100)","example":25},"title":{"type":["string","null"],"maxLength":128,"description":"Job title of the owner","example":"CEO"},"tax_type":{"type":["string","null"],"enum":["SSN","ITIN"],"description":"Tax identifier type. Mandatory when country is US; must be SSN or ITIN.","example":"SSN"},"id":{"type":"string","minLength":15,"maxLength":15}},"required":["id"]}},"incorporation_doc_file":{"type":["string","null"],"format":"uri","description":"Please upload your articles of incorporation below. The articles of incorporation or a certificate of incorporation usually includes information like the company name, business purpose, number of shares offered, value of shares, etc. Only PDF and image files are accepted (.jpg, .jpeg, .png, .pdf) with a maximum size of 3MB."},"proof_of_ownership_doc_file":{"type":["string","null"],"format":"uri","description":"Please upload your proof of ownership below. This document usually includes information like the shareholders names and percentages. Only PDF and image files are accepted (.jpg, .jpeg, .png, .pdf) with a maximum size of 3MB."},"source_of_funds_doc_type":{"type":["string","null"],"enum":["business_income","gambling_proceeds","gifts","government_benefits","inheritance","investment_loans","pension_retirement","salary","sale_of_assets_real_estate","savings","esops","investment_proceeds","someone_else_funds"]},"source_of_funds_doc_file":{"type":["string","null"],"format":"uri"},"selfie_file":{"type":["string","null"],"format":"uri","description":"Only image files are accepted (.jpg, .jpeg, .png)"},"purpose_of_transactions":{"type":["string","null"],"enum":["business_transactions","charitable_donations","investment_purposes","payments_to_friends_or_family_abroad","personal_or_living_expenses","protect_wealth","purchase_good_and_services","receive_payment_for_freelancing","receive_salary","other"]},"purpose_of_transactions_explanation":{"type":["string","null"]},"account_purpose":{"type":["string","null"],"enum":["charitable_donations","ecommerce_retail_payments","investment_purposes","business_expenses","payments_to_friends_or_family_abroad","personal_or_living_expenses","protect_wealth","purchase_goods_and_services","receive_payments_for_goods_and_services","tax_optimization","third_party_money_transmission","payroll","treasury_management","other"]},"account_purpose_other":{"type":["string","null"],"maxLength":512,"description":"Required when account_purpose is \"other\". Max 512 characters."},"business_type":{"type":["string","null"],"enum":["corporation","llc","partnership","sole_proprietorship","trust","non_profit"]},"business_description":{"type":["string","null"],"maxLength":512},"business_industry":{"type":["string","null"],"enum":["111998","112120","113310","115114","541211","541810","541430","541715","541930","561422","561311","561612","561740","561730","236115","236220","237310","238210","811111","812111","812112","532111","624410","541922","811210","812199","611110","611310","611410","611710","211120","212114","221310","562111","562920","213112","522110","522210","522320","523150","523940","523999","524113","813110","813211","813219","551112","721110","722511","722513","561510","713110","713210","712110","711110","711211","621111","621210","622110","623110","621511","623220","541940","621399","621910","541110","311421","337121","322220","339920","334210","339930","312130","334111","334118","325412","339112","336110","336390","315990","313110","339910","516120","513130","512250","519130","711410","711510","531110","531120","531130","531190","531210","531311","531312","531320","531390","454110","445110","455110","457110","449210","444110","459210","459120","445320","458110","458210","458310","455219","424210","456110","446120","541511","541512","541519","518210","511210","517111","517112","517410","481111","483111","485210","488510","484121","493110","423430","423690","423110","423830","423840","423510","424690","424990","424410","424480","423940","541611","541618","541330","541990","541214","561499"]},"estimated_annual_revenue":{"type":["string","null"],"enum":["0_99999","100000_999999","1000000_9999999","10000000_49999999","50000000_249999999","250000000_plus"]},"source_of_wealth":{"type":["string","null"],"enum":["business_dividends_or_profits","investments","asset_sales","client_investor_contributions","gambling","charitable_contributions","inheritance","affiliate_or_royalty_income"]},"publicly_traded":{"type":["boolean","null"]},"occupation":{"type":["string","null"],"maxLength":255},"external_id":{"type":["string","null"]},"tos_id":{"type":["string","null"],"minLength":15,"maxLength":15},"additional_info":{"type":["array","null"],"items":{"type":"object","properties":{"label":{"type":"string","enum":["EIN_LETTER","KYC_PROVIDER_DOCUMENT","FLOW_OF_FUNDS","BANK_STATEMENT","TAX_RETURN","AUDITED_FINANCIALS","OPERATING_AGREEMENT","BOARD_RESOLUTION","CERTIFICATE_OF_GOOD_STANDING","BUSINESS_LICENSE","MSB_LICENSE","POWER_OF_ATTORNEY","TRUST_DEED","SHAREHOLDER_REGISTRY","BENEFICIAL_OWNER_DECLARATION","COMPLIANCE_QUESTIONNAIRE","PROOF_OF_EMPLOYMENT","REFERENCE_LETTER","OTHER"]},"value":{"type":"string","minLength":1}},"required":["label","value"],"example":{"label":"EIN_LETTER","value":"https://example.com/ein.pdf"}},"description":"Optional extra documents or notes for this receiver. `label` is a known category, `value` is either a URL to upload or a free-text description. Any URLs are downloaded and re-hosted on Blindpay storage before being stored."}},"required":["email","country"],"description":"Update a customer"}},"required":["instance_id","id"]},
    method: "put",
    pathTemplate: "/v1/instances/{instance_id}/customers/{id}",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["DeleteV1InstancesCustomersById", {
    name: "DeleteV1InstancesCustomersById",
    description: `Delete Customer`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"id":{"type":"string","minLength":15,"maxLength":15}},"required":["instance_id","id"]},
    method: "delete",
    pathTemplate: "/v1/instances/{instance_id}/customers/{id}",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1InstancesLimitsCustomersById", {
    name: "GetV1InstancesLimitsCustomersById",
    description: `Retrieve Customer Limits`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"id":{"type":"string","minLength":15,"maxLength":15}},"required":["instance_id","id"]},
    method: "get",
    pathTemplate: "/v1/instances/{instance_id}/limits/customers/{id}",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1InstancesCustomersRfi", {
    name: "GetV1InstancesCustomersRfi",
    description: `Returns the open (pending) RFI for this customer, or null if the customer has no pending RFI.`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"customer_id":{"type":"string","minLength":15,"maxLength":15,"description":"Customer ID"}},"required":["instance_id","customer_id"]},
    method: "get",
    pathTemplate: "/v1/instances/{instance_id}/customers/{customer_id}/rfi",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"customer_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1InstancesCustomersRfi", {
    name: "PostV1InstancesCustomersRfi",
    description: `Submit a flat response object for the open RFI. On success flips kyc_status back to verifying. Returns \`{ success: false, reason }\` when no pending RFI exists, callers should refetch the RFI state instead of retrying.`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"customer_id":{"type":"string","minLength":15,"maxLength":15,"description":"Customer ID"},"requestBody":{"type":"object","additionalProperties":{},"description":"The JSON request body."}},"required":["instance_id","customer_id"]},
    method: "post",
    pathTemplate: "/v1/instances/{instance_id}/customers/{customer_id}/rfi",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"customer_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1InstancesCustomersRfiExternalToken", {
    name: "PostV1InstancesCustomersRfiExternalToken",
    description: `Mint a 27-day JWT that lets anyone with the link answer the customer's open RFI without logging in.`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"customer_id":{"type":"string","minLength":15,"maxLength":15,"description":"Customer ID"}},"required":["instance_id","customer_id"]},
    method: "post",
    pathTemplate: "/v1/instances/{instance_id}/customers/{customer_id}/rfi/external-token",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"customer_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetV1EInstancesCustomersRfi", {
    name: "GetV1EInstancesCustomersRfi",
    description: `Get Open RFI via Invite Token`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"customer_id":{"type":"string","minLength":15,"maxLength":15,"description":"Customer ID"},"token":{"type":"string"}},"required":["instance_id","customer_id","token"]},
    method: "get",
    pathTemplate: "/v1/e/instances/{instance_id}/customers/{customer_id}/rfi",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"customer_id","in":"path"},{"name":"token","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostV1EInstancesCustomersRfi", {
    name: "PostV1EInstancesCustomersRfi",
    description: `Submit RFI Response via Invite Token`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"customer_id":{"type":"string","minLength":15,"maxLength":15,"description":"Customer ID"},"token":{"type":"string"},"requestBody":{"type":"object","additionalProperties":{},"description":"The JSON request body."}},"required":["instance_id","customer_id","token"]},
    method: "post",
    pathTemplate: "/v1/e/instances/{instance_id}/customers/{customer_id}/rfi",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"customer_id","in":"path"},{"name":"token","in":"query"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostWebhooksAiprise_aipriseValidationKey_", {
    name: "PostWebhooksAiprise_aipriseValidationKey_",
    description: `Executes POST /webhooks/aiprise/:aiprise_validation_key?`,
    inputSchema: {"type":"object","properties":{"aiprise_validation_key":{"type":["string","null"],"default":""},"requestBody":{"type":"object","properties":{"business_profile_event_type":{"type":"string","enum":["RESULT_UPDATE","RUN_BUSINESS_VERIFICATION"]},"event_type":{"type":"string","enum":["CASE_STATUS_UPDATE","VERIFICATION_SESSION_COMPLETION"]},"business_profile_result":{"type":"string","enum":["APPROVED","DECLINED"]},"client_reference_id":{"type":"string"},"aiprise_summary":{"type":"object","properties":{"verification_result":{"type":"string","enum":["APPROVED","DECLINED","REVIEW"]}},"required":["verification_result"]},"verification_result":{"type":"string","enum":["APPROVED","DECLINED"]},"business_profile_id":{"type":"string"},"verification_session_id":{"type":"string"},"reason":{"type":"object","properties":{"code":{"type":"string"},"message":{"type":"string"}},"required":["code","message"]},"id_info":{"type":"object","properties":{"result":{"type":"string","enum":["APPROVED","DECLINED","REVIEW"]},"warnings":{"type":["array","null"],"items":{"type":"object","properties":{"code":{"type":["string","null"]},"message":{"type":["string","null"]},"resolution_status":{"type":["string","null"]},"warning_id":{"type":["string","null"]}}},"description":"You can find more information here: https://docs.aiprise.com/docs/warnings-and-error-codes"},"document_details":{"type":"object","properties":{"ocr_data":{"type":"object","properties":{"front_number":{"type":"string"},"number":{"type":"string"}}}}},"id_number":{"type":"string"}}},"face_liveness_info":{"type":"object","properties":{"check_summary":{"type":"object","additionalProperties":{"type":"string"}},"result":{"type":"string","enum":["APPROVED","DECLINED","REVIEW"]},"section_id":{"type":"string"},"status":{"type":"string"},"warnings":{"type":["array","null"],"items":{"type":"object","properties":{"code":{"type":["string","null"]},"message":{"type":["string","null"]},"resolution_status":{"type":["string","null"]},"warning_id":{"type":["string","null"]}}},"description":"You can find more information here: https://docs.aiprise.com/docs/warnings-and-error-codes"}}}},"required":["client_reference_id"],"description":"Receive webhooks from Aiprise"}}},
    method: "post",
    pathTemplate: "/webhooks/aiprise/:aiprise_validation_key?",
    executionParameters: [{"name":"aiprise_validation_key","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostWebhooksBitso", {
    name: "PostWebhooksBitso",
    description: `Executes POST /webhooks/bitso`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"event":{"type":"string","enum":["withdrawal","funding"]},"payload":{"type":"object","properties":{"wid":{"type":"string"},"fid":{"type":"string"},"status":{"type":"string"},"created_at":{"type":"string"},"currency":{"type":"string"},"method":{"type":"string"},"method_name":{"type":"string"},"amount":{"type":"string"},"asset":{"type":"string"},"network":{"type":"string"},"protocol":{"type":"string"},"integration":{"type":"string"},"fee":{"type":"string"},"details":{"type":"object","properties":{"origin_id":{"type":"string"},"address":{"type":"string"},"destination_tag":{"type":"string"},"ripple_transaction_hash":{"type":"string"},"cvu":{"type":"string"},"description":{"type":"string"},"end_to_end_id":{"type":"string"},"payee":{"type":"object","properties":{"account_number":{"type":"string"},"tax_id":{"type":"string"},"name":{"type":"string"},"bank_name":{"type":"string"},"bank_code":{"type":"string"}}},"payer":{"type":"object","properties":{"account_number":{"type":"string"},"tax_id":{"type":"string"},"name":{"type":"string"},"bank_name":{"type":"string"},"bank_code":{"type":"string"}}},"is_reversal":{"type":"boolean"},"sender_name":{"type":"string"},"sender_clabe":{"type":"string"},"sender_bank":{"anyOf":[{"type":"string"},{"type":"number"}]},"clave":{"anyOf":[{"type":"string"},{"type":"number"}]},"clave_rastreo":{"type":"string"},"numeric_reference":{"type":"string"},"concepto":{"type":"string"},"cep_link":{"type":"string"},"sender_cuitcuil":{"type":"string"},"sender_address":{"type":"string"},"sender_scheme":{"type":"string"},"transfer_summary":{"type":"string"},"payment_id":{"type":"string"},"sender_rfc_curp":{"type":"string"},"deposit_type":{"type":"string"}}},"payer":{"type":"object","properties":{"account_number":{"type":"string"},"tax_id":{"type":"string"},"name":{"type":"string"},"bank_name":{"type":"string"},"bank_code":{"type":"string"}}},"expires_at":{"type":"string"},"payed_at":{"type":"string"},"qr_code_payload":{"type":"string"}}}},"required":["event","payload"],"description":"Receive webhooks from Bitso"}}},
    method: "post",
    pathTemplate: "/webhooks/bitso",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostWebhooksInter", {
    name: "PostWebhooksInter",
    description: `Executes POST /webhooks/inter`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"event":{"type":"object","properties":{"log":{"anyOf":[{"type":"object","properties":{"type":{"type":"string"},"errors":{"type":"array","items":{"type":"string"}},"deposit":{"type":"object","properties":{"id":{"type":"string"},"tags":{"type":"array","items":{"type":"string"}},"amount":{"type":"number"},"name":{"type":"string"},"taxId":{"type":"string"},"bankCode":{"type":"string"},"branchCode":{"type":"string"},"accountNumber":{"type":"string"},"accountType":{"type":"string"},"type":{"type":"string"}},"required":["tags"]}},"required":["deposit"]},{"type":"object","properties":{"type":{"type":"string"},"errors":{"type":"array","items":{"type":"string"}},"transfer":{"type":"object","properties":{"id":{"type":"string"},"status":{"type":"string"},"amount":{"type":"number"},"name":{"type":"string"},"taxId":{"type":"string"},"bankCode":{"type":"string"},"branchCode":{"type":"string"},"accountNumber":{"type":"string"},"externalId":{"type":"string"},"fee":{"type":"number"},"tags":{"type":"array","items":{"type":"string"}},"metadata":{"type":"object","properties":{"authentication":{"type":"string"}}}},"required":["id","status"]}},"required":["type","transfer"]}]},"workspaceId":{"type":"string"}},"required":["log","workspaceId"]}},"required":["event"],"description":"Receive webhooks from Inter"}}},
    method: "post",
    pathTemplate: "/webhooks/inter",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostWebhooksApprovedTransaction", {
    name: "PostWebhooksApprovedTransaction",
    description: `Executes POST /webhooks/approved-transaction`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"id":{"type":"number"},"transaction_id":{"type":"string"},"amount":{"type":"number"},"metadata":{"type":["object","null"],"properties":{}},"source":{"type":"string"},"destination":{"type":"string"},"type":{"type":"string","enum":["ach","pix","wire","crypto"]},"source_type":{"type":"string","enum":["individual","business"]},"source_tier":{"type":"string","enum":["standard","enhanced"]},"status":{"type":"string","enum":["pending","approved","completed","failed","on-hold"]},"created_at":{"type":"string"},"updated_at":{"type":"string"},"deleted_at":{"type":["string","null"]}},"required":["id","transaction_id","amount","source","destination","type","source_type","source_tier","status"],"description":"Receive webhooks from Approved Transaction"}}},
    method: "post",
    pathTemplate: "/webhooks/approved-transaction",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostWebhooksBlockchain", {
    name: "PostWebhooksBlockchain",
    description: `Executes POST /webhooks/blockchain`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"idempotency_key":{"type":["string","null"]},"transaction_hash":{"type":["string","null"]},"status":{"type":["string","null"]},"network":{"type":["string","null"]},"recipient":{"type":["string","null"]},"amount":{"type":["string","null"]},"token":{"type":["string","null"]},"gas_used":{"type":["string","null"]},"confirmed_at":{"type":["string","null"]}},"description":"Receive webhooks from Blockchain"}}},
    method: "post",
    pathTemplate: "/webhooks/blockchain",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostWebhooksPrivy", {
    name: "PostWebhooksPrivy",
    description: `Executes POST /webhooks/privy`,
    inputSchema: {"type":"object","properties":{"requestBody":{"description":"Receive webhooks from Privy"}}},
    method: "post",
    pathTemplate: "/webhooks/privy",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostWebhooksStripeInvoice", {
    name: "PostWebhooksStripeInvoice",
    description: `Executes POST /webhooks/stripe/invoice`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"type":{"type":"string"},"data":{"type":"object","properties":{"object":{}}}},"required":["type","data"],"description":"Receive webhooks from Stripe for invoice status updates"}}},
    method: "post",
    pathTemplate: "/webhooks/stripe/invoice",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostWebhooksCircle", {
    name: "PostWebhooksCircle",
    description: `Executes POST /webhooks/circle`,
    inputSchema: {"type":"object","properties":{"requestBody":{"oneOf":[{"type":"object","properties":{"notificationType":{"type":"string","enum":["transactions.outbound","transactions.inbound"]},"notification":{"type":"object","properties":{"id":{"type":"string"},"refId":{"type":["string","null"]},"state":{"type":"string","enum":["CONFIRMED","PENDING_RISK_SCREENING","QUEUED","SENT","CANCELLED","COMPLETE"]},"errorReason":{"type":["string","null"]},"transactionType":{"type":"string","enum":["OUTBOUND","INBOUND"]},"txHash":{"type":"string"},"blockchain":{"type":"string","enum":["ETH","ETH-SEPOLIA","AVAX","AVAX-FUJI","MATIC","MATIC-AMOY","SOL","SOL-DEVNET","ARB","ARB-SEPOLIA","BASE","BASE-SEPOLIA","NEAR","NEAR-TESTNET","EVM","EVM-TESTNET","UNI-SEPOLIA"]},"tokenId":{"type":"string"},"amounts":{"type":"array","items":{"type":"string"}},"walletId":{"type":"string"},"sourceAddress":{"type":["string","null"]},"destinationAddress":{"type":["string","null"]},"createDate":{"type":["string","null"]},"updateDate":{"type":["string","null"]},"networkFeeInUSD":{"type":["string","null"]}},"required":["id","state","transactionType","txHash","blockchain","tokenId","amounts","walletId"]},"timestamp":{"type":["string","null"]}},"required":["notificationType","notification"]},{"type":"object","properties":{"subscriptionId":{"type":"string"},"notificationId":{"type":"string"},"notificationType":{"type":"string","enum":["webhooks.test"]},"notification":{"type":"object","properties":{"hello":{"type":"string"}},"required":["hello"]},"timestamp":{"type":["string","null"]},"version":{"type":"number"}},"required":["subscriptionId","notificationId","notificationType","notification","version"]}],"description":"Receive webhooks from Circle"}}},
    method: "post",
    pathTemplate: "/webhooks/circle",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostWebhooksCheckbook", {
    name: "PostWebhooksCheckbook",
    description: `Executes POST /webhooks/checkbook`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"id":{"type":"string"},"amount":{"type":["string","null"]},"balance":{"type":["string","null"]},"user_id":{"type":["string","null"]},"type":{"type":"string","enum":["PREFUND_ACCOUNT","CHECK"]},"status":{"type":["string","null"],"enum":["IN_PROCESS","PAID","FAILED","PRINTED","VOID","EXPIRED","MAILED","REFUNDED"]}},"required":["id","type"],"description":"Receive webhooks from Checkbook"}}},
    method: "post",
    pathTemplate: "/webhooks/checkbook",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostWebhooksSolana", {
    name: "PostWebhooksSolana",
    description: `Executes POST /webhooks/solana`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"forwarderPublicKey":{"type":"string"},"bankAccountId":{"type":"string"},"txSignature":{"type":"string"},"amount":{"type":"string"},"tokenAddress":{"type":"string"},"tokenSymbol":{"type":"string"},"beneficiary":{"type":"string"},"timestamp":{"type":"string"}},"required":["forwarderPublicKey","bankAccountId","txSignature","amount","tokenAddress","tokenSymbol","beneficiary","timestamp"],"description":"Receive webhooks from Solana"}}},
    method: "post",
    pathTemplate: "/webhooks/solana",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostWebhooksTron", {
    name: "PostWebhooksTron",
    description: `Executes POST /webhooks/tron`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"event":{"type":"string"},"deposit":{"type":"object","properties":{"id":{"type":"string"},"walletAddress":{"type":"string"},"amount":{"type":"string"},"transactionHash":{"type":"string"},"blockHash":{"type":"string"},"blockNumber":{"type":"string"},"fromAddress":{"type":"string"},"status":{"type":"string"},"createdAt":{"type":"string"},"confirmedAt":{"type":["string","null"]}},"required":["id","walletAddress","amount","transactionHash","blockHash","blockNumber","fromAddress","status","createdAt","confirmedAt"]},"wallet":{"type":"object","properties":{"bankAccountId":{"type":"string"},"address":{"type":"string"}},"required":["bankAccountId","address"]},"timestamp":{"type":"string"}},"required":["event","deposit","wallet","timestamp"],"description":"Receive webhooks from Tron"}}},
    method: "post",
    pathTemplate: "/webhooks/tron",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostWebhooksDtr", {
    name: "PostWebhooksDtr",
    description: `Executes POST /webhooks/dtr`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"type":{"type":"string","enum":["fiatToCrypto","cryptoToFiat","KYC","KYB","unblockBankAccount"]},"subType":{"type":"string"},"uuid":{"type":"string"},"data":{}},"required":["type","subType","uuid"],"description":"Receive webhooks from DTR"}}},
    method: "post",
    pathTemplate: "/webhooks/dtr",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostWebhooksOpenfx", {
    name: "PostWebhooksOpenfx",
    description: `Executes POST /webhooks/openfx`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"data":{"type":"array","items":{"type":"object","properties":{"id":{"type":"string"},"transactionHash":{"type":"string"}},"required":["id"]}}},"required":["data"],"description":"Receive webhooks from DTR"}}},
    method: "post",
    pathTemplate: "/webhooks/openfx",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostWebhooksCheckbookReconciliation", {
    name: "PostWebhooksCheckbookReconciliation",
    description: `Executes POST /webhooks/checkbook/reconciliation`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"records":{"type":"array","items":{"type":"object","properties":{"id":{"type":"string"},"amount":{"type":["number","null"]},"name":{"type":["string","null"]},"prefundAccountId":{"type":"string"},"createdTs":{"type":["number","null"]},"prefundAccount":{"type":"object","properties":{"id":{"type":"string"},"userId":{"type":"string"},"default":{"type":"boolean"},"routingNumber":{"type":"string"},"type":{"type":"string"},"status":{"type":"string"},"createdTs":{"type":"number"},"active":{"type":"boolean"},"billing":{"type":"boolean"},"disabled":{"type":"boolean"},"isPrefunded":{"type":"boolean"},"balance":{"type":"number"},"verifier":{"type":"string"},"referenceId":{"type":"string"}},"required":["id","userId","default","routingNumber","type","status","createdTs","active","billing","disabled","isPrefunded","balance","verifier","referenceId"]},"user":{"type":"object","properties":{"id":{"type":["string","null"]},"email":{"type":"string"},"firstName":{"type":"string"},"lastName":{"type":"string"},"businessName":{"type":"string"},"active":{"type":"boolean"},"createdTs":{"type":"number"},"onboarderId":{"type":"string"},"userId":{"type":"string"}},"required":["email","firstName","lastName","businessName","active","createdTs","onboarderId","userId"]},"originDetails":{"type":"object","properties":{"origCompanyName":{"type":["string","null"]},"origId":{"type":["string","null"]},"descDate":{"type":["string","null"]},"eed":{"type":["string","null"]},"coEntryDescr":{"type":["string","null"]},"sec":{"type":["string","null"]},"trace":{"type":["string","null"]},"trn":{"type":["string","null"]},"indId":{"type":["string","null"]},"indName":{"type":["string","null"]},"vxrNumber":{"type":["string","null"]},"descr":{"type":["string","null"]},"rawText":{"type":["string","null"]}}}},"required":["id","prefundAccountId","prefundAccount","user","originDetails"]}},"source":{"type":"string","enum":["checkbook","manual"],"default":"manual"},"description":{"type":"string"}},"required":["records"],"description":"Receive Checkbook JSON data for reconciliation in the database"}}},
    method: "post",
    pathTemplate: "/webhooks/checkbook/reconciliation",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostWebhooksOnemoney", {
    name: "PostWebhooksOnemoney",
    description: `Executes POST /webhooks/onemoney`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"event_name":{"type":"string","enum":["kyb.pending","kyb.additional_info_required","kyb.completed","kyb.rejected","fiat_account.activated","deposit.completed","deposit.failed","deposit.reversed","withdrawal.completed","withdrawal.failed","withdrawal.returned","conversion.completed","conversion.failed","external_account.approved","external_account.failed","transfer.completed","auto_conversion_rule.create","auto_conversion_rule_order.completed","auto_conversion_rule_order.deposit_failed","auto_conversion_rule_order.conversion_failed","auto_conversion_rule_order.withdrawal_failed"]},"resource":{"type":"object","properties":{"type":{"type":"string","enum":["customers","fiat_accounts","deposits","withdrawals","conversions","external_accounts","transfers","auto_conversion_rules","auto_conversion_rule_orders","fiat_account","kyb_applicant"]},"id":{"type":"string"}},"required":["type","id"]},"data":{"type":"object","properties":{"status":{"type":"string","enum":["PENDING","PENDING_RESPONSE","APPROVED","REJECTED","ACTIVATED","COMPLETED","FAILED","REVERSED","RETURNED","SUCCESS"]},"currency":{"type":"string"},"created_at":{"type":"string"},"customer_id":{"type":"string"},"modified_at":{"type":"string"},"transaction_id":{"type":"string"}},"required":["status"]}},"required":["event_name","resource","data"],"description":"Receive webhooks from OneMoney"}}},
    method: "post",
    pathTemplate: "/webhooks/onemoney",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostWebhooksParfin", {
    name: "PostWebhooksParfin",
    description: `Executes POST /webhooks/parfin`,
    inputSchema: {"type":"object","properties":{"requestBody":{"anyOf":[{"type":"object","properties":{"currency_pair":{"type":"string"},"side":{"type":"string"},"status":{"type":"string"},"is_manual":{"type":"string"},"order_id":{"type":"string"},"quote_id":{"type":"string"},"ledger_id":{"type":"string"},"user_id":{"type":"string"},"user_internal_id":{"type":"string"},"exchange":{"type":"object","properties":{"order_id":{"type":"string"},"amount":{"type":"string"},"clean_cost":{"type":"string"},"clean_price":{"type":"string"},"cost":{"type":"string"},"currency_pair":{"type":"string"},"date_time":{"type":"string"},"done":{"type":"string"},"enabled":{"type":"string"},"exchange_type":{"type":"string"},"fee":{"type":"string"},"fee_currency":{"type":"string"},"id":{"type":"string"},"ledger_ids":{"type":"array","items":{"type":"string"}},"price":{"type":"string"},"side":{"type":"string"},"status":{"type":"string"},"trade_ids":{"type":"array","items":{"type":"string"}}}},"forex":{"type":"object","properties":{"amount":{"type":"string"},"clean_cost":{"type":"string"},"clean_price":{"type":"string"},"cost":{"type":"string"},"currency_pair":{"type":"string"},"date_time":{"type":"string"},"decimal_precision":{"type":"string"},"done":{"type":"string"},"external_ids":{"type":"array","items":{"type":"string"}},"is_manual":{"type":"string"},"ledger_ids":{"type":"array","items":{"type":"string"}},"offline_additional_spread":{"type":"string"},"price":{"type":"string"},"side":{"type":"string"},"status":{"type":"string"},"taxes":{"type":"string"}}},"quote":{"type":"object","properties":{"amount":{"type":"string"},"clean_cost":{"type":"string"},"clean_price":{"type":"string"},"cost":{"type":"string"},"currency_pair":{"type":"string"},"date_time":{"type":"string"},"external_id":{"type":"string"},"final_spread":{"type":"string"},"price":{"type":"string"},"side":{"type":"string"},"spread":{"type":"string"}}}}},{"type":"object","properties":{"amount":{"type":"string"},"auto_identified":{"type":"string"},"destination":{"type":"string"},"bank":{"type":"string"},"document":{"type":"string"},"name":{"type":"string"},"created_at":{"type":"string"},"transaction_type":{"type":"string"},"updated_at":{"type":"string"},"currency_type":{"type":"string"},"user_id":{"type":"string"},"funding_id":{"type":"string"},"currency":{"type":"string"},"customer_id":{"type":"string"},"transaction":{"type":["string","null"]},"status":{"type":"string"},"tags":{"type":"array","items":{"type":"object","properties":{"key":{"type":"string"},"value":{"type":"string"}},"required":["key","value"]}}}},{"type":"object","properties":{"ListenedSmartContractId":{"type":"string"},"BlockchainId":{"type":"string"},"LogIndex":{"type":"string"},"CreatedAt":{"type":"string"},"Event":{"type":"string"},"TransactionHash":{"type":"string"},"CustomerId":{"type":"string"},"Id":{"type":"string"},"ContractAddress":{"type":"string"}}},{"type":"object","properties":{"WalletId":{"type":"string"},"Name":{"type":"string"},"Address":{"type":"string"},"BlockchainNetwork":{"type":"string"},"Assets":{"type":"array","items":{"type":"object","properties":{"AssetId":{"type":"string"},"AvailableBalance":{"type":"string"},"Balance":{"type":"string"},"TokenId":{"type":"string"},"TokenName":{"type":"string"},"TokenCode":{"type":"string"},"CreatedTime":{"type":"string"}}}},"CustomerRefId":{"type":["string","null"]},"CustomerTag":{"type":["string","null"]},"IsBlocked":{"type":"boolean"},"BlockedMetadataHistory":{"type":"array","items":{"type":"object","additionalProperties":{}}}}},{"type":"object","properties":{"Id":{"type":"string"},"AssetId":{"type":"string"},"CreatedUserId":{"type":"string"},"ParfinId":{"type":"string"},"Destinations":{"type":"array","items":{"type":"string"}},"Asset":{"type":"string"},"Sources":{"type":"array","items":{"type":"string"}},"WalletId":{"type":"string"},"CreatedAt":{"type":"string"},"Direction":{"type":"string"},"Amount":{"anyOf":[{"type":"number"},{"type":"string"}]},"Fee":{"anyOf":[{"type":"number"},{"type":"string"}]},"BlockchainNetwork":{"type":"string"},"Preference":{"type":"string"},"Status":{"anyOf":[{"type":"number"},{"type":"string"}]},"StatusDescription":{"type":"string"},"HashBlockChain":{"type":"string"},"RawTransaction":{"type":"string"},"MetadataFromBlockchain":{"type":"string"},"TransactionType":{"type":"string"},"IsRisky":{"type":"boolean"},"CustomerId":{"type":"string"}}},{"type":"object","properties":{"Id":{"type":"string"},"AvailableBalance":{"type":"string"},"Balance":{"type":"string"},"ActivationTime":{"type":"string"},"BalanceLastUpdate":{"type":"string"},"AvailableBalanceLastUpdate":{"type":"string"},"WalletAddress":{"type":"string"},"WalletId":{"type":"string"},"BlockchainTokenId":{"type":"string"},"BlockchainTokenCode":{"type":"string"},"BlockchainTokenName":{"type":"string"},"CustomerId":{"type":"string"}}},{"type":"object","properties":{"customer_id":{"type":"string"},"user_id":{"type":"string"},"user_internal_id":{"type":"string"},"external_id":{"type":"string"},"name":{"type":"string"},"deposit_addresses":{"type":"array","items":{"type":"object","properties":{"currency":{"type":"string"},"is_internal_wallet":{"type":"boolean"},"is_enabled":{"type":"boolean"},"address":{"type":"string"},"wallet_id":{"type":"string"},"bank":{"type":"object","properties":{"document":{"type":"string"},"document_type":{"type":"string"},"bank_code":{"type":"number"},"bank_name":{"type":"string"},"account":{"type":"string"},"branch":{"type":"number"}}}}}},"quote_spread":{"type":"object","properties":{"buy":{"type":"object","properties":{"use":{"type":"boolean"},"spread":{"type":"number"}}},"sell":{"type":"object","properties":{"use":{"type":"boolean"},"spread":{"type":"number"}}}}},"document":{"type":"object","properties":{"tax_identification":{"type":"string"},"type":{"type":"string"}}},"user_api":{"type":"object","properties":{"is_enabled":{"type":"boolean"},"audience":{"type":"string"}}},"full_address":{"type":"object","properties":{"city":{"type":"string"},"state":{"type":"string"},"address":{"type":"string"},"postal_code":{"type":"string"},"country":{"type":"string"}}},"limit":{"type":"number"},"tax_domicile":{"type":"string"},"role":{"type":"string"},"email":{"type":"string"},"phone":{"anyOf":[{"type":"string"},{"type":"number"}]},"details":{"type":"string"},"spread":{"type":"number"},"is_enabled":{"type":"boolean"},"creation_date":{"type":"string"}}},{"type":"object","properties":{"quote_id":{"type":"string"},"currency_pair":{"type":"string"},"side":{"type":"string"},"input_type":{"type":"string"},"quotes":{"type":"array","items":{"type":"object","properties":{"is_best_price":{"type":"boolean"},"exchange":{"type":"object","properties":{"id":{"type":"string"},"name":{"type":"string"},"connection_id":{"type":"string"},"priority":{"type":"number"}}},"calculation_memory":{"type":["object","null"],"properties":{"forex":{"type":"object","properties":{"clean_price":{"type":"number"},"taxes_price":{"type":"number"},"taxes_price_settings":{"type":"number"},"offline_spread_price":{"type":"number"},"offline_spread_price_settings":{"type":"number"},"price":{"type":"number"},"provider":{"type":"string"},"public_price":{"type":"boolean"}}},"trade":{"type":"object","properties":{"clean_price":{"type":"number"},"fee_price":{"type":"number"},"price":{"type":"number"},"provider":{"type":"string"},"spread_price":{"type":"number"},"spread_price_settings":{"type":"number"}}}}},"rule_out":{"type":["object","null"],"properties":{"code":{"type":"string"},"description":{"type":"string"}}}}}}}},{"type":"object","additionalProperties":{}}],"description":"Receive webhooks from Parfin. Entity type is determined by x-webhook-entity header."}}},
    method: "post",
    pathTemplate: "/webhooks/parfin",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostWebhooksVeem", {
    name: "PostWebhooksVeem",
    description: `Executes POST /webhooks/veem`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"type":{"type":"string","enum":["OUTBOUND_PAYMENT_STATUS_UPDATED","INBOUND_PAYMENT_STATUS_UPDATED","ACCOUNT_STATUS_UPDATED","OUTBOUND_INVOICE_STATUS_UPDATED","INBOUND_INVOICE_STATUS_UPDATED","VBA_ACCOUNT_STATUS_UPDATED","VBA_TRANSACTION"]},"data":{"anyOf":[{"type":"object","properties":{"id":{"type":"number"},"invoiceId":{"type":["number","null"]},"status":{"type":"string","enum":["Drafted","Sent","PendingAuth","Authorized","InProgress","Complete","Cancelled","Closed","Inactive"]},"statusReason":{"type":["string","null"]},"debitTxn":{},"creditTxn":{},"refundTxn":{},"originalRequestId":{"type":["string","null"]},"payerFundingMethodType":{"type":["string","null"]},"receiverFundingMethodType":{"type":["string","null"]},"payerAccountId":{"type":["number","null"]},"payeeAccountId":{"type":["number","null"]}},"required":["id","status"]},{"type":"object","properties":{"accountId":{"anyOf":[{"type":"string"},{"type":"number"},{"type":"null"}]},"fundingMethodId":{"anyOf":[{"type":"string"},{"type":"number"},{"type":"null"}]},"paymentId":{"anyOf":[{"type":"string"},{"type":"number"},{"type":"null"}]},"counterParty":{"type":["object","null"],"properties":{"name":{"type":["string","null"]},"accountNumber":{"type":["string","null"]},"iban":{"type":["string","null"]},"method":{"type":["string","null"]},"routingCode":{"type":["string","null"]},"address":{"type":["string","null"]}}},"balance":{"type":["object","null"],"properties":{"currency":{"type":["string","null"]},"amount":{"type":["number","null"]}}},"transaction":{"type":"object","properties":{"currency":{"type":["string","null"]},"amount":{"type":["number","null"]},"status":{"type":["string","null"]},"direction":{"type":["string","null"]},"transactionDate":{"type":["number","null"]},"reference":{"type":["string","null"]},"additionalReference":{"type":["string","null"]},"rail":{"type":["string","null"]}}}},"required":["transaction"]},{"type":"object","properties":{"accountId":{"anyOf":[{"type":"string"},{"type":"number"},{"type":"null"}]},"fundingMethodId":{"anyOf":[{"type":"string"},{"type":"number"},{"type":"null"}]},"accountReference":{"type":["string","null"]},"currency":{"type":["string","null"]},"status":{"type":["string","null"]}}},{"type":"object","additionalProperties":{}},{"type":"string"}]}},"required":["type","data"],"description":"Receive webhooks from Veem (e.g. OUTBOUND_PAYMENT_STATUS_UPDATED)."}}},
    method: "post",
    pathTemplate: "/webhooks/veem",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostWebhooksZenus", {
    name: "PostWebhooksZenus",
    description: `Executes POST /webhooks/zenus`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"notificationId":{"type":["string","null"]},"notificationTypeCode":{"type":["string","null"]},"destination":{"type":["string","null"]},"originalMessageDateTime":{"type":["string","null"]},"data":{"type":["object","null"],"additionalProperties":{}}},"description":"Receive webhooks from Zenus Bank (PAYMENT_PROCESSED, PAYMENT_SETTLED, ACCOUNT_TRANSACTION_CREATED_V3, etc)."}}},
    method: "post",
    pathTemplate: "/webhooks/zenus",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostWebhooksCpn", {
    name: "PostWebhooksCpn",
    description: `Executes POST /webhooks/cpn`,
    inputSchema: {"type":"object","properties":{"requestBody":{"oneOf":[{"type":"object","properties":{"subscriptionId":{"type":["string","null"]},"notificationId":{"type":["string","null"]},"notificationType":{"type":"string","enum":["cpn.payment.created","cpn.payment.fiatPaymentInitiated","cpn.payment.completed","cpn.payment.failed","cpn.payment.refunded","cpn.payment.rfiCreated","cpn.payment.rfiResolved","cpn.payment.rfiExpired"]},"notification":{"type":"object","properties":{"type":{"type":["string","null"]},"id":{"type":["string","null"]},"quoteId":{"type":["string","null"]},"status":{"type":["string","null"]},"customerRefId":{"type":["string","null"]},"refCode":{"type":["string","null"]},"blockchain":{"type":["string","null"]},"senderAddress":{"type":["string","null"]},"paymentMethodType":{"type":["string","null"]},"sourceAmount":{"type":["object","null"],"properties":{"amount":{"type":"string"},"currency":{"type":"string"}},"required":["amount","currency"]},"destinationAmount":{"type":["object","null"],"properties":{"amount":{"type":"string"},"currency":{"type":"string"}},"required":["amount","currency"]},"fiatNetworkPaymentRef":{"type":["string","null"]},"failureReason":{"type":["string","null"]}}},"timestamp":{"type":["string","null"]},"version":{"type":["number","null"]}},"required":["notificationType","notification"]},{"type":"object","properties":{"subscriptionId":{"type":"string"},"notificationId":{"type":"string"},"notificationType":{"type":"string","enum":["webhooks.test"]},"notification":{"type":"object","properties":{"hello":{"type":"string"}},"required":["hello"]},"timestamp":{"type":["string","null"]},"version":{"type":["number","null"]}},"required":["subscriptionId","notificationId","notificationType","notification"]}],"description":"Receive payment lifecycle events from Circle Cross-Border Payment Network."}}},
    method: "post",
    pathTemplate: "/webhooks/cpn",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetIBillingInstancesRecurringItems", {
    name: "GetIBillingInstancesRecurringItems",
    description: `List recurring items`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15}},"required":["instance_id"]},
    method: "get",
    pathTemplate: "/i/billing/instances/{instance_id}/recurring-items",
    executionParameters: [{"name":"instance_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostIBillingInstancesRecurringItems", {
    name: "PostIBillingInstancesRecurringItems",
    description: `Create recurring item`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"requestBody":{"type":"object","properties":{"description":{"type":"string","minLength":1},"amount":{"type":"number","minimum":0,"description":"Amount in cents"},"frequency_months":{"type":"number","exclusiveMinimum":0},"first_invoice_sequence":{"type":"number","exclusiveMinimum":0},"product_id":{"type":["string","null"]}},"required":["description","amount","frequency_months","first_invoice_sequence"],"description":"The JSON request body."}},"required":["instance_id"]},
    method: "post",
    pathTemplate: "/i/billing/instances/{instance_id}/recurring-items",
    executionParameters: [{"name":"instance_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetIBillingInstancesRecurringItemsById", {
    name: "GetIBillingInstancesRecurringItemsById",
    description: `Get recurring item by id`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"id":{"type":"string"}},"required":["instance_id","id"]},
    method: "get",
    pathTemplate: "/i/billing/instances/{instance_id}/recurring-items/{id}",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["DeleteIBillingInstancesRecurringItemsById", {
    name: "DeleteIBillingInstancesRecurringItemsById",
    description: `Soft delete recurring item`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"id":{"type":"string"}},"required":["instance_id","id"]},
    method: "delete",
    pathTemplate: "/i/billing/instances/{instance_id}/recurring-items/{id}",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PatchIBillingInstancesRecurringItemsById", {
    name: "PatchIBillingInstancesRecurringItemsById",
    description: `Update recurring item`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15},"id":{"type":"string"},"requestBody":{"type":"object","properties":{"description":{"type":"string","minLength":1},"amount":{"type":"number","minimum":0},"frequency_months":{"type":"number","exclusiveMinimum":0},"first_invoice_sequence":{"type":"number","exclusiveMinimum":0},"product_id":{"type":["string","null"]}},"description":"The JSON request body."}},"required":["instance_id","id"]},
    method: "patch",
    pathTemplate: "/i/billing/instances/{instance_id}/recurring-items/{id}",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetIBillingInstancesInvoiceCollections", {
    name: "GetIBillingInstancesInvoiceCollections",
    description: `List invoice collections (partner fee payouts)`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string","minLength":15,"maxLength":15}},"required":["instance_id"]},
    method: "get",
    pathTemplate: "/i/billing/instances/{instance_id}/invoice-collections",
    executionParameters: [{"name":"instance_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetIBillingInvoiceCollections", {
    name: "GetIBillingInvoiceCollections",
    description: `List all invoice collections across all instances`,
    inputSchema: {"type":"object","properties":{}},
    method: "get",
    pathTemplate: "/i/billing/invoice-collections",
    executionParameters: [],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostITreasuryCheckbookToOpenfx", {
    name: "PostITreasuryCheckbookToOpenfx",
    description: `Executes POST /i/treasury/checkbook-to-openfx`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"amount":{"type":"number"},"instanceId":{"type":"string"},"description":{"type":"string","maxLength":128},"bankAccountId":{"type":"string"}},"required":["amount","bankAccountId"],"description":"The JSON request body."}}},
    method: "post",
    pathTemplate: "/i/treasury/checkbook-to-openfx",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostITreasuryBlindpayToFbo", {
    name: "PostITreasuryBlindpayToFbo",
    description: `Executes POST /i/treasury/blindpay-to-fbo`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"toInstanceId":{"type":"string"},"amount":{"type":"number"}},"required":["toInstanceId","amount"],"description":"The JSON request body."}}},
    method: "post",
    pathTemplate: "/i/treasury/blindpay-to-fbo",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostITreasuryFboToFbo", {
    name: "PostITreasuryFboToFbo",
    description: `Executes POST /i/treasury/fbo-to-fbo`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"fromInstanceId":{"type":"string"},"toInstanceId":{"type":"string"},"amount":{"type":"number"}},"required":["fromInstanceId","toInstanceId","amount"],"description":"The JSON request body."}}},
    method: "post",
    pathTemplate: "/i/treasury/fbo-to-fbo",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetITreasuryBalance", {
    name: "GetITreasuryBalance",
    description: `Executes GET /i/treasury/balance`,
    inputSchema: {"type":"object","properties":{}},
    method: "get",
    pathTemplate: "/i/treasury/balance",
    executionParameters: [],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostIOperationCheckbookMissingPayin", {
    name: "PostIOperationCheckbookMissingPayin",
    description: `Executes POST /i/operation/checkbook-missing-payin`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"amount":{"type":"number"},"receiver_id":{"type":"string"},"id":{"type":"string"}},"required":["amount","receiver_id","id"],"description":"The JSON request body."}}},
    method: "post",
    pathTemplate: "/i/operation/checkbook-missing-payin",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostIOperationUpdatePixSenderData", {
    name: "PostIOperationUpdatePixSenderData",
    description: `Executes POST /i/operation/update-pix-sender-data`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"payin_id":{"type":"string"}},"required":["payin_id"],"description":"The JSON request body."}}},
    method: "post",
    pathTemplate: "/i/operation/update-pix-sender-data",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostIOperationCheckbookClearCustomerFunds", {
    name: "PostIOperationCheckbookClearCustomerFunds",
    description: `Executes POST /i/operation/checkbook-clear-customer-funds`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"amount":{"type":"number"},"cb_wallet_id":{"type":"string"}},"required":["amount","cb_wallet_id"],"description":"The JSON request body."}}},
    method: "post",
    pathTemplate: "/i/operation/checkbook-clear-customer-funds",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostIOperationSendUsdCheckbook", {
    name: "PostIOperationSendUsdCheckbook",
    description: `Executes POST /i/operation/send-usd-checkbook`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"payoutId":{"type":"string"},"ignoreCheckbookDeposit":{"type":"boolean"}},"required":["payoutId","ignoreCheckbookDeposit"],"description":"Check arrive crypto"}}},
    method: "post",
    pathTemplate: "/i/operation/send-usd-checkbook",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostIOperationVoidCheckCheckbook", {
    name: "PostIOperationVoidCheckCheckbook",
    description: `Executes POST /i/operation/void-check-checkbook`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"checkId":{"type":"string"},"receiverId":{"type":"string"}},"required":["checkId","receiverId"],"description":"Void check"}}},
    method: "post",
    pathTemplate: "/i/operation/void-check-checkbook",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostIOperationCheckbookCheckFail", {
    name: "PostIOperationCheckbookCheckFail",
    description: `Executes POST /i/operation/checkbook-check-fail`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"checkId":{"type":"string"},"receiverId":{"type":"string"}},"required":["checkId"],"description":"Fail check"}}},
    method: "post",
    pathTemplate: "/i/operation/checkbook-check-fail",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostIOperationCompletePayout", {
    name: "PostIOperationCompletePayout",
    description: `Executes POST /i/operation/complete-payout`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"payoutId":{"type":"string"},"payoutIds":{"type":"array","items":{"type":"string"}}},"description":"Complete payout"}}},
    method: "post",
    pathTemplate: "/i/operation/complete-payout",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostIOperationUpdatePayinPayerData", {
    name: "PostIOperationUpdatePayinPayerData",
    description: `Executes POST /i/operation/update-payin-payer-data`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"id":{"type":"string"},"sender_name":{"type":"string"},"sender_tax_id":{"type":"string"},"sender_bank_code":{"type":"string"},"sender_account_number":{"type":"string"}},"required":["id"],"description":"Update payin with payer data and complete transaction"}}},
    method: "post",
    pathTemplate: "/i/operation/update-payin-payer-data",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostIOperationMarkFailed", {
    name: "PostIOperationMarkFailed",
    description: `Executes POST /i/operation/mark-failed`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"id":{"type":"string","description":"Payin or Payout ID"},"type":{"type":"string","enum":["payin","payout"],"description":"Transaction type"}},"required":["id","type"],"description":"The JSON request body."}}},
    method: "post",
    pathTemplate: "/i/operation/mark-failed",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostIOperationMarkCompleted", {
    name: "PostIOperationMarkCompleted",
    description: `Executes POST /i/operation/mark-completed`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"id":{"type":"string","description":"Payin or Payout ID"},"type":{"type":"string","enum":["payin","payout"],"description":"Transaction type"},"txHash":{"type":"string","description":"Blockchain transaction hash for the crypto transfer"}},"required":["id","type"],"description":"The JSON request body."}}},
    method: "post",
    pathTemplate: "/i/operation/mark-completed",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostIOperationMarkRefunded", {
    name: "PostIOperationMarkRefunded",
    description: `Executes POST /i/operation/mark-refunded`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"payoutId":{"type":"string","description":"Payout ID to mark as refunded"},"refundTxHash":{"type":"string","description":"Transaction hash of the refund"}},"required":["payoutId"],"description":"The JSON request body."}}},
    method: "post",
    pathTemplate: "/i/operation/mark-refunded",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostIOperationUpdatePayout", {
    name: "PostIOperationUpdatePayout",
    description: `Executes POST /i/operation/update-payout`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"payout_id":{"type":"string"},"sender_amount":{"type":"number"},"receiver_amount":{"type":"number"},"commercial_quotation":{"type":"number"},"blindpay_quotation":{"type":"number"},"created_at":{"type":"string","format":"date"}},"required":["payout_id"],"description":"Update payout quote amounts"}}},
    method: "post",
    pathTemplate: "/i/operation/update-payout",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostIOperationUpdatePayin", {
    name: "PostIOperationUpdatePayin",
    description: `Executes POST /i/operation/update-payin`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"payin_id":{"type":"string"},"sender_amount":{"type":"number"},"receiver_amount":{"type":"number"},"commercial_quotation":{"type":"number"},"blindpay_quotation":{"type":"number"},"created_at":{"type":"string","format":"date"},"status":{"type":"string","enum":["processing","on_hold","failed","refunded","completed"]}},"required":["payin_id"],"description":"Update payin quote amounts"}}},
    method: "post",
    pathTemplate: "/i/operation/update-payin",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostIOperationBulkCreateOtcPayins", {
    name: "PostIOperationBulkCreateOtcPayins",
    description: `Executes POST /i/operation/bulk-create-otc-payins`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"string","description":"Bulk create completed OTC payins from CSV file. Only rows with tx_hash are processed. The created_at date is overridden to the provided day/month/year after insertion (DB trigger workaround)."}}},
    method: "post",
    pathTemplate: "/i/operation/bulk-create-otc-payins",
    executionParameters: [],
    requestBodyContentType: "multipart/form-data",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostIOperationBulkCreatePayouts", {
    name: "PostIOperationBulkCreatePayouts",
    description: `Executes POST /i/operation/bulk-create-payouts`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"payouts":{"type":"array","items":{"type":"object","properties":{"blindpay_quotation":{"type":"number","description":"Blindpay quotation (e.g., 539.27 means 1 USD = 5.3927 BRL)"},"commercial_quotation":{"type":"number","description":"Commercial quotation (e.g., 541.44 means 1 USD = 5.4144 BRL)"},"sender_amount":{"type":"number","description":"Sender amount in cents (64902 = 649.02 USDT)"},"receiver_amount":{"type":"number","description":"Receiver amount in cents (350000 = 3500.00 BRL)"},"created_at":{"type":"string","description":"ISO timestamp for payout creation"},"instance_id":{"type":"string","minLength":15,"maxLength":15},"bank_account_id":{"type":"string","minLength":15,"maxLength":15},"sender_wallet_address":{"type":"string","description":"Sender wallet address"},"transaction_hash":{"type":"string","description":"Blockchain transaction hash"},"network":{"type":"string","description":"Blockchain network"},"transaction_fee_amount":{"type":"number","description":"Total fee amount in cents (100 = 1.00 BRL)"},"token":{"type":"string","description":"Token type"}},"required":["blindpay_quotation","commercial_quotation","sender_amount","receiver_amount","created_at","instance_id","bank_account_id","sender_wallet_address","transaction_hash","network","transaction_fee_amount","token"]}}},"required":["payouts"],"description":"Bulk create completed payouts"}}},
    method: "post",
    pathTemplate: "/i/operation/bulk-create-payouts",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostIRefundPayout", {
    name: "PostIRefundPayout",
    description: `Executes POST /i/refund/payout`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"payoutId":{"type":"string"},"isCheckbookReturn":{"type":["boolean","null"]},"refundPartnerFeeTxHash":{"type":["string","null"]}},"required":["payoutId"],"description":"The JSON request body."}}},
    method: "post",
    pathTemplate: "/i/refund/payout",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostIRefundPayin", {
    name: "PostIRefundPayin",
    description: `Executes POST /i/refund/payin`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"payinId":{"type":"string"},"transactionHash":{"type":"string"}},"required":["payinId","transactionHash"],"description":"The JSON request body."}}},
    method: "post",
    pathTemplate: "/i/refund/payin",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostIExportCheckbookBalances", {
    name: "PostIExportCheckbookBalances",
    description: `Executes POST /i/export/checkbook-balances`,
    inputSchema: {"type":"object","properties":{}},
    method: "post",
    pathTemplate: "/i/export/checkbook-balances",
    executionParameters: [],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetISearchCheckbookCheck", {
    name: "GetISearchCheckbookCheck",
    description: `Executes GET /i/search/checkbook/check`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"id":{"type":"string"}},"required":["id"],"description":"The JSON request body."}}},
    method: "get",
    pathTemplate: "/i/search/checkbook/check",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostIComplianceSwiftPayout", {
    name: "PostIComplianceSwiftPayout",
    description: `Approve or reject a SWIFT payout pending compliance review`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"id":{"type":"string","minLength":15,"maxLength":15,"description":"Payout ID"},"status":{"type":"string","enum":["approved","rejected"],"description":"Review decision"},"reviewed_by":{"type":"string","description":"Reviewer email/name"},"description":{"type":"string","maxLength":128,"description":"Optional payment description to add or update"}},"required":["id","status","reviewed_by"],"description":"The JSON request body."}}},
    method: "post",
    pathTemplate: "/i/compliance/swift-payout",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostIComplianceLimitIncrease", {
    name: "PostIComplianceLimitIncrease",
    description: `Executes POST /i/compliance/limit-increase`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"id":{"type":"string","minLength":15,"maxLength":15},"status":{"type":"string","enum":["in_review","approved","rejected"]},"reviewed_by":{"type":"string","maxLength":255},"approved_per_transaction":{"type":["integer","null"],"maximum":100000000000},"approved_daily":{"type":["integer","null"],"maximum":100000000000},"approved_monthly":{"type":["integer","null"],"maximum":100000000000}},"required":["id","status","reviewed_by"],"description":"The JSON request body."}}},
    method: "post",
    pathTemplate: "/i/compliance/limit-increase",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostICheckbookSetupFbo", {
    name: "PostICheckbookSetupFbo",
    description: `Executes POST /i/checkbook/setup-fbo`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"instance_id":{"type":"string"},"account_number":{"type":"string"},"checkbook_platform_id":{"type":["string","null"],"maxLength":256},"checkbook_platform_key":{"type":["string","null"],"maxLength":256},"checkbook_platform_email":{"type":["string","null"],"maxLength":256,"format":"email"},"checkbook_platform_name":{"type":["string","null"],"maxLength":256},"checkbook_platform_secret":{"type":"string"}},"required":["instance_id","account_number","checkbook_platform_secret"],"description":"The JSON request body."}}},
    method: "post",
    pathTemplate: "/i/checkbook/setup-fbo",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetIOnemoneyTosLink", {
    name: "GetIOnemoneyTosLink",
    description: `Executes GET /i/onemoney/tos-link`,
    inputSchema: {"type":"object","properties":{"redirect_url":{"type":"string","format":"uri","description":"URL to redirect after TOS is signed"}},"required":["redirect_url"]},
    method: "get",
    pathTemplate: "/i/onemoney/tos-link",
    executionParameters: [{"name":"redirect_url","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostIOnemoneyExportBalance", {
    name: "PostIOnemoneyExportBalance",
    description: `Executes POST /i/onemoney/export-balance`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"email":{"type":"string","format":"email","description":"Email address to receive the CSV export"}},"required":["email"],"description":"The JSON request body."}}},
    method: "post",
    pathTemplate: "/i/onemoney/export-balance",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostIOnemoneyActivateVirtualAccount", {
    name: "PostIOnemoneyActivateVirtualAccount",
    description: `Executes POST /i/onemoney/activate-virtual-account`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"receiver_id":{"type":"string","description":"The receiver ID to activate the virtual account for"}},"required":["receiver_id"],"description":"The JSON request body."}}},
    method: "post",
    pathTemplate: "/i/onemoney/activate-virtual-account",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostIOnemoneyQuote", {
    name: "PostIOnemoneyQuote",
    description: `Executes POST /i/onemoney/quote`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"receiver_id":{"type":"string","description":"The receiver ID to get the quote for"},"amount":{"type":"number","description":"USD amount to convert to (e.g. 100.00)"}},"required":["receiver_id","amount"],"description":"The JSON request body."}}},
    method: "post",
    pathTemplate: "/i/onemoney/quote",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostIOnemoneyClearBalance", {
    name: "PostIOnemoneyClearBalance",
    description: `Executes POST /i/onemoney/clear-balance`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"receiver_id":{"type":"string","description":"The receiver ID whose 1money balance should be cleared"}},"required":["receiver_id"],"description":"The JSON request body."}}},
    method: "post",
    pathTemplate: "/i/onemoney/clear-balance",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetIOnemoneyTransaction", {
    name: "GetIOnemoneyTransaction",
    description: `Executes GET /i/onemoney/transaction`,
    inputSchema: {"type":"object","properties":{"payoutId":{"type":"string","description":"The payout ID to look up the OneMoney transaction for"}},"required":["payoutId"]},
    method: "get",
    pathTemplate: "/i/onemoney/transaction",
    executionParameters: [{"name":"payoutId","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostICompliancePaymentReview", {
    name: "PostICompliancePaymentReview",
    description: `Approve or reject a payout pending manual review`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"id":{"type":"string","minLength":15,"maxLength":15,"description":"Payout ID"},"status":{"type":"string","enum":["approved","rejected"],"description":"Review decision"},"reviewed_by":{"type":"string","description":"Reviewer email"},"rejection_reason":{"type":"string","description":"Reason for rejection"}},"required":["id","status","reviewed_by"],"description":"The JSON request body."}}},
    method: "post",
    pathTemplate: "/i/compliance/payment-review",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostIVeemUpdateUbos", {
    name: "PostIVeemUpdateUbos",
    description: `Executes POST /i/veem/update-ubos`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"receiverId":{"type":"string","description":"The receiver ID to update UBOs for"},"onlyUpload":{"type":"boolean","default":false},"type":{"type":"string","enum":["individual","business"],"default":"business"}},"required":["receiverId"],"description":"The JSON request body."}}},
    method: "post",
    pathTemplate: "/i/veem/update-ubos",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostIVeemCreateAccount", {
    name: "PostIVeemCreateAccount",
    description: `Executes POST /i/veem/create-account`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"receiverId":{"type":"string","description":"The receiver ID to create a Veem account for"}},"required":["receiverId"],"description":"The JSON request body."}}},
    method: "post",
    pathTemplate: "/i/veem/create-account",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostIVeemClearUsd", {
    name: "PostIVeemClearUsd",
    description: `Executes POST /i/veem/clear-usd`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"receiverId":{"type":"string","description":"The receiver ID to clear USD wallet balance for"}},"required":["receiverId"],"description":"The JSON request body."}}},
    method: "post",
    pathTemplate: "/i/veem/clear-usd",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostIVeemClearUsdVba", {
    name: "PostIVeemClearUsdVba",
    description: `Executes POST /i/veem/clear-usd-vba`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"receiverId":{"type":"string","description":"The receiver ID to clear VBA USD balance for"}},"required":["receiverId"],"description":"The JSON request body."}}},
    method: "post",
    pathTemplate: "/i/veem/clear-usd-vba",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostIVeemLinkExistingVba", {
    name: "PostIVeemLinkExistingVba",
    description: `Executes POST /i/veem/link-existing-vba`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"virtualAccountId":{"type":"string","description":"The virtual account ID to back-fill with an existing Veem VBA"}},"required":["virtualAccountId"],"description":"The JSON request body."}}},
    method: "post",
    pathTemplate: "/i/veem/link-existing-vba",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostIVeemExportBalance", {
    name: "PostIVeemExportBalance",
    description: `Executes POST /i/veem/export-balance`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"email":{"type":"string","format":"email","description":"Email address to receive the CSV export"}},"required":["email"],"description":"The JSON request body."}}},
    method: "post",
    pathTemplate: "/i/veem/export-balance",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetIVeemVba", {
    name: "GetIVeemVba",
    description: `Executes GET /i/veem/vba`,
    inputSchema: {"type":"object","properties":{"kyc_status":{"type":"string","description":"Filter by kyc_status (default: approved)"},"limit":{"type":"number","minimum":1,"maximum":1000},"offset":{"type":["integer","null"],"minimum":0}}},
    method: "get",
    pathTemplate: "/i/veem/vba",
    executionParameters: [{"name":"kyc_status","in":"query"},{"name":"limit","in":"query"},{"name":"offset","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetIVeemVbaTransactions", {
    name: "GetIVeemVbaTransactions",
    description: `Executes GET /i/veem/vba-transactions`,
    inputSchema: {"type":"object","properties":{"veemCustomerId":{"type":"string","description":"Veem customer ID (receiver.veem_customer_id)"},"veemVbaId":{"type":"string","description":"Veem VBA ID (virtual_account.veem_vba_id)"}},"required":["veemCustomerId","veemVbaId"]},
    method: "get",
    pathTemplate: "/i/veem/vba-transactions",
    executionParameters: [{"name":"veemCustomerId","in":"query"},{"name":"veemVbaId","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostIStarkbankUpdatePayinSenderDetails", {
    name: "PostIStarkbankUpdatePayinSenderDetails",
    description: `Executes POST /i/starkbank/update-payin-sender-details`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"payinId":{"type":"string","description":"The payin ID to update sender details for"}},"required":["payinId"],"description":"The JSON request body."}}},
    method: "post",
    pathTemplate: "/i/starkbank/update-payin-sender-details",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostIComplianceVirtualAccountReview", {
    name: "PostIComplianceVirtualAccountReview",
    description: `Approve or reject a virtual account pending manual review`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"id":{"type":"string","description":"Virtual Account ID"},"status":{"type":"string","enum":["approved","rejected"],"description":"Review decision"},"reviewed_by":{"type":"string","description":"Reviewer email"},"rejection_reason":{"type":"string","description":"Reason for rejection"},"signed_agreement_id":{"type":"string","description":"OneMoney signed agreement ID (required for HSBC approval)"}},"required":["id","status","reviewed_by"],"description":"The JSON request body."}}},
    method: "post",
    pathTemplate: "/i/compliance/virtual-account-review",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostICompliancePayinReview", {
    name: "PostICompliancePayinReview",
    description: `Approve or reject a payin pending manual review`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"id":{"type":"string","minLength":15,"maxLength":15,"description":"Payin ID"},"status":{"type":"string","enum":["approved","rejected"],"description":"Review decision"},"reviewed_by":{"type":"string","description":"Reviewer email"},"rejection_reason":{"type":"string","description":"Reason for rejection"}},"required":["id","status","reviewed_by"],"description":"The JSON request body."}}},
    method: "post",
    pathTemplate: "/i/compliance/payin-review",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostITedPayinsMarkReceived", {
    name: "PostITedPayinsMarkReceived",
    description: `Ops manually confirms a TED deposit was received for a payin. Resumes arrive-ted to credit the receiver.`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"id":{"type":"string","minLength":15,"maxLength":15,"description":"Payin ID"},"sender_name":{"type":"string","description":"TED sender name from the StarkBank deposit"},"sender_tax_id":{"type":"string","description":"TED sender CPF/CNPJ"},"sender_bank_code":{"type":"string","description":"TED sender bank COMPE code"},"sender_account_number":{"type":"string","description":"TED sender account number"}},"required":["id"],"description":"The JSON request body."}}},
    method: "post",
    pathTemplate: "/i/ted-payins/mark-received",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostISolanaExportBalance", {
    name: "PostISolanaExportBalance",
    description: `Executes POST /i/solana/export-balance`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"email":{"type":"string","format":"email","description":"Email address to receive the CSV export"}},"required":["email"],"description":"The JSON request body."}}},
    method: "post",
    pathTemplate: "/i/solana/export-balance",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostITronExportBalance", {
    name: "PostITronExportBalance",
    description: `Executes POST /i/tron/export-balance`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"email":{"type":"string","format":"email","description":"Email address to receive the CSV export"}},"required":["email"],"description":"The JSON request body."}}},
    method: "post",
    pathTemplate: "/i/tron/export-balance",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetIAuditLogsInstancesByInstanceId", {
    name: "GetIAuditLogsInstancesByInstanceId",
    description: `Executes GET /i/audit-logs/instances/{instance_id}`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string"},"limit":{"type":"string","enum":["10","50","100","200","500","1000"],"description":"Number of items to return"},"offset":{"type":"string","enum":["0","10","50","100","200","500","1000"],"description":"Number of items to skip"},"starting_after":{"type":"string","description":"A cursor for use in pagination. starting_after is an object ID that defines your place in the list."},"ending_before":{"type":"string","description":"A cursor for use in pagination. ending_before is an object ID that defines your place in the list."},"feature":{"type":"string"},"operation":{"type":"string","enum":["create","update","delete"]},"actor_type":{"type":"string","enum":["user","api_key"]},"user_id":{"type":"string"},"api_key_id":{"type":"string"},"entity_type":{"type":"string"},"entity_id":{"type":"string"},"start_date":{"type":"string","format":"date-time"},"end_date":{"type":"string","format":"date-time"}},"required":["instance_id"]},
    method: "get",
    pathTemplate: "/i/audit-logs/instances/{instance_id}",
    executionParameters: [{"name":"instance_id","in":"path"},{"name":"limit","in":"query"},{"name":"offset","in":"query"},{"name":"starting_after","in":"query"},{"name":"ending_before","in":"query"},{"name":"feature","in":"query"},{"name":"operation","in":"query"},{"name":"actor_type","in":"query"},{"name":"user_id","in":"query"},{"name":"api_key_id","in":"query"},{"name":"entity_type","in":"query"},{"name":"entity_id","in":"query"},{"name":"start_date","in":"query"},{"name":"end_date","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostIComplaint", {
    name: "PostIComplaint",
    description: `Executes POST /i/complaint`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"first_name":{"type":"string","minLength":1},"last_name":{"type":"string","minLength":1},"email":{"type":"string","format":"email"},"complaint_type":{"type":"string","minLength":1},"description":{"type":"string","minLength":20,"maxLength":5000}},"required":["first_name","last_name","email","complaint_type","description"],"description":"The JSON request body."}}},
    method: "post",
    pathTemplate: "/i/complaint",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetIFeedback", {
    name: "GetIFeedback",
    description: `Executes GET /i/feedback`,
    inputSchema: {"type":"object","properties":{"limit":{"type":"string","enum":["10","50","100","200","500","1000"],"description":"Number of items to return"},"offset":{"type":"string","enum":["0","10","50","100","200","500","1000"],"description":"Number of items to skip"},"starting_after":{"type":"string","description":"A cursor for use in pagination. starting_after is an object ID that defines your place in the list."},"ending_before":{"type":"string","description":"A cursor for use in pagination. ending_before is an object ID that defines your place in the list."},"type":{"type":"string","enum":["bug","suggestion","feedback","praise","complaint"]},"instance_id":{"type":"string"}}},
    method: "get",
    pathTemplate: "/i/feedback",
    executionParameters: [{"name":"limit","in":"query"},{"name":"offset","in":"query"},{"name":"starting_after","in":"query"},{"name":"ending_before","in":"query"},{"name":"type","in":"query"},{"name":"instance_id","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetIComplianceReceiversRfi", {
    name: "GetIComplianceReceiversRfi",
    description: `Returns the most recent RFI for this receiver regardless of status (pending, submitted, expired, cancelled), or null if the receiver has never had an RFI.`,
    inputSchema: {"type":"object","properties":{"receiver_id":{"type":"string","minLength":15,"maxLength":15}},"required":["receiver_id"]},
    method: "get",
    pathTemplate: "/i/compliance/receivers/{receiver_id}/rfi",
    executionParameters: [{"name":"receiver_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostIComplianceReceiversRfi", {
    name: "PostIComplianceReceiversRfi",
    description: `Creates a new Request for Information for a receiver. Sets kyc_status to compliance_request and fires the email workflow.`,
    inputSchema: {"type":"object","properties":{"receiver_id":{"type":"string","minLength":15,"maxLength":15},"requestBody":{"type":"object","properties":{"created_by_email":{"type":"string","format":"email"},"request":{"type":"array","items":{"type":"object","properties":{"title":{"type":"string","minLength":1,"maxLength":256},"description":{"type":"string","maxLength":4096},"supporting_document":{"type":"string","format":"uri"},"fields":{"type":"array","items":{"type":"object","properties":{"key":{"type":"string","minLength":1,"maxLength":128},"label":{"type":"string","minLength":1,"maxLength":256},"regex":{"type":"string","maxLength":512},"required":{"type":"boolean"},"items":{"type":"array","items":{"type":"object","properties":{"label":{"type":"string"},"value":{"type":"string"}},"required":["label","value"]}},"multiple":{"type":"boolean"}},"required":["key","label","required"]},"minItems":1,"maxItems":20}},"required":["title","description","fields"]},"minItems":1,"maxItems":20}},"required":["created_by_email","request"],"description":"The JSON request body."}},"required":["receiver_id"]},
    method: "post",
    pathTemplate: "/i/compliance/receivers/{receiver_id}/rfi",
    executionParameters: [{"name":"receiver_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostIComplianceReceiversKycDecision", {
    name: "PostIComplianceReceiversKycDecision",
    description: `Approves or rejects a receiver's KYC. Only allowed for receivers without an active AiPrise session — those must be decided through the AiPrise flow at /customer-review (single source of truth). Closes the loop on the latest RFI by stamping reviewed_by.`,
    inputSchema: {"type":"object","properties":{"receiver_id":{"type":"string","minLength":15,"maxLength":15},"requestBody":{"type":"object","properties":{"decision":{"type":"string","enum":["approved","rejected"]},"reviewed_by":{"type":"string","format":"email"},"reason":{"type":"string","maxLength":2048}},"required":["decision","reviewed_by"],"description":"The JSON request body."}},"required":["receiver_id"]},
    method: "post",
    pathTemplate: "/i/compliance/receivers/{receiver_id}/kyc-decision",
    executionParameters: [{"name":"receiver_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostIComplianceReceiversRfiCancel", {
    name: "PostIComplianceReceiversRfiCancel",
    description: `Cancels an open RFI and restores kyc_status to the snapshotted pre-RFI status. Returns \`{ success: false, reason }\` when the RFI is no longer pending (already resolved/cancelled in another tab) so callers can refresh state.`,
    inputSchema: {"type":"object","properties":{"receiver_id":{"type":"string","minLength":15,"maxLength":15},"rfi_id":{"type":"string"}},"required":["receiver_id","rfi_id"]},
    method: "post",
    pathTemplate: "/i/compliance/receivers/{receiver_id}/rfi/{rfi_id}/cancel",
    executionParameters: [{"name":"receiver_id","in":"path"},{"name":"rfi_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostIInstancesDynamicRateOtc", {
    name: "PostIInstancesDynamicRateOtc",
    description: `Update dynamic OTC rate markup for an instance`,
    inputSchema: {"type":"object","properties":{"instance_id":{"type":"string"},"requestBody":{"type":"object","properties":{"dynamic_rate_otc":{"type":"number","minimum":0,"description":"Dynamic OTC rate markup in basis points (e.g. 5 = 0.05%)"}},"required":["dynamic_rate_otc"],"description":"The JSON request body."}},"required":["instance_id"]},
    method: "post",
    pathTemplate: "/i/instances/{instance_id}/dynamic-rate-otc",
    executionParameters: [{"name":"instance_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetIPlatformSettingsOtcProvider", {
    name: "GetIPlatformSettingsOtcProvider",
    description: `Returns the active OTC liquidity provider routing target.`,
    inputSchema: {"type":"object","properties":{}},
    method: "get",
    pathTemplate: "/i/platform-settings/otc-provider",
    executionParameters: [],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostIPlatformSettingsOtcProvider", {
    name: "PostIPlatformSettingsOtcProvider",
    description: `Updates the active OTC liquidity provider routing target.`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"provider":{"type":"string","enum":["parfin","brasilbtc","ebury"]},"actor":{"type":"string"}},"required":["provider"],"description":"The JSON request body."}}},
    method: "post",
    pathTemplate: "/i/platform-settings/otc-provider",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetIPlatformSettingsOtcManualExecution", {
    name: "GetIPlatformSettingsOtcManualExecution",
    description: `Returns whether the OTC controller skips executeQuoteOTC (operator converts manually).`,
    inputSchema: {"type":"object","properties":{}},
    method: "get",
    pathTemplate: "/i/platform-settings/otc-manual-execution",
    executionParameters: [],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostIPlatformSettingsOtcManualExecution", {
    name: "PostIPlatformSettingsOtcManualExecution",
    description: `Enable/disable the manual OTC liquidity mode. When enabled, new OTC payins skip the provider's quote execution and wait for an operator to mark them concluded from the backoffice.`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"enabled":{"type":"boolean"},"actor":{"type":"string"}},"required":["enabled"],"description":"The JSON request body."}}},
    method: "post",
    pathTemplate: "/i/platform-settings/otc-manual-execution",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetIPlatformSettingsOtcEnabled", {
    name: "GetIPlatformSettingsOtcEnabled",
    description: `Returns whether new OTC payins are currently accepted. Defaults to enabled when unset.`,
    inputSchema: {"type":"object","properties":{}},
    method: "get",
    pathTemplate: "/i/platform-settings/otc-enabled",
    executionParameters: [],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostIPlatformSettingsOtcEnabled", {
    name: "PostIPlatformSettingsOtcEnabled",
    description: `Enable/disable accepting new OTC payins. When disabled, payins whose quote is flagged is_otc are rejected before reaching a liquidity provider. In-flight payins are unaffected.`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"enabled":{"type":"boolean"},"actor":{"type":"string"}},"required":["enabled"],"description":"The JSON request body."}}},
    method: "post",
    pathTemplate: "/i/platform-settings/otc-enabled",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetIOtcManualQueue", {
    name: "GetIOtcManualQueue",
    description: `Lists payins whose manual_execution_status is "pending", oldest first.`,
    inputSchema: {"type":"object","properties":{}},
    method: "get",
    pathTemplate: "/i/otc/manual-queue",
    executionParameters: [],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostIOtcPayinConcludeManual", {
    name: "PostIOtcPayinConcludeManual",
    description: `Marks a manual-execution payin as concluded after the operator has converted BRL → USDT off-platform.`,
    inputSchema: {"type":"object","properties":{"id":{"type":"string"},"requestBody":{"type":"object","properties":{"actor":{"type":"string"}},"description":"The JSON request body."}},"required":["id"]},
    method: "post",
    pathTemplate: "/i/otc/payin/{id}/conclude-manual",
    executionParameters: [{"name":"id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostIOtcPayinMarkManualFailed", {
    name: "PostIOtcPayinMarkManualFailed",
    description: `Marks a manual-execution payin as failed (operator could not, or chose not to, convert it). Removes the payin from the manual queue. Does NOT change payin.status — refund / force handling stays in the existing Mark / Refund / Force flow.`,
    inputSchema: {"type":"object","properties":{"id":{"type":"string"},"requestBody":{"type":"object","properties":{"actor":{"type":"string"}},"description":"The JSON request body."}},"required":["id"]},
    method: "post",
    pathTemplate: "/i/otc/payin/{id}/mark-manual-failed",
    executionParameters: [{"name":"id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostIOtcRfq", {
    name: "PostIOtcRfq",
    description: `Fetches a fresh OTC quote from Parfin, BrasilBTC and Ebury in parallel. Used by the manual-execution UI to compare live rates side by side.`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"payin_id":{"type":"string"}},"required":["payin_id"],"description":"The JSON request body."}}},
    method: "post",
    pathTemplate: "/i/otc/rfq",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostIOtcPayinExecuteAtProvider", {
    name: "PostIOtcPayinExecuteAtProvider",
    description: `Executes a fresh OTC quote at the chosen provider, then marks the payin manual_execution_status=concluded.`,
    inputSchema: {"type":"object","properties":{"id":{"type":"string"},"requestBody":{"type":"object","properties":{"provider":{"type":"string","enum":["parfin","brasilbtc"]},"actor":{"type":"string"}},"required":["provider"],"description":"The JSON request body."}},"required":["id"]},
    method: "post",
    pathTemplate: "/i/otc/payin/{id}/execute-at-provider",
    executionParameters: [{"name":"id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostIOtcRfqAdhoc", {
    name: "PostIOtcRfqAdhoc",
    description: `Fetches a fresh OTC quote from Parfin, BrasilBTC and Ebury in parallel for an arbitrary amount, with no payin attached. Used by the backoffice Pull Quote flow to compare live rates. currency=BRL quotes by cost (you pay BRL, receive USDT); currency=USDT quotes by quantity (you receive USDT, pay BRL). Ebury quotes BRL→USD and is treated as USD≈USDT 1:1.`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"amount":{"type":"number","exclusiveMinimum":0},"currency":{"type":"string","enum":["BRL","USDT"]}},"required":["amount","currency"],"description":"The JSON request body."}}},
    method: "post",
    pathTemplate: "/i/otc/rfq-adhoc",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostILedgerResolveAccountNames", {
    name: "PostILedgerResolveAccountNames",
    description: `Resolve a batch of ledger account names to receiver display labels.

The ledger writes account names of the form
\`blindpay:<provider>:vba:<provider_id>:<asset>\`. For provider rows that
map back to a receiver (OneMoney customer, Veem VBA, Zenus child VBA,
etc.) we look up the matching \`virtual_account\` row and join to the
\`receiver\` to produce a short display label. Names that don't follow
the VBA pattern, or that have no matching virtual_account/receiver
(e.g. the Zenus master FBO \`ID-177522\`), are omitted from the
response — the caller should fall back to the raw name in that case.`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"names":{"type":"array","items":{"type":"string"},"maxItems":500,"description":"Ledger account names to resolve to a human-readable client name."}},"required":["names"],"description":"The JSON request body."}}},
    method: "post",
    pathTemplate: "/i/ledger/resolve-account-names",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
  ["GetILedgerFxRates", {
    name: "GetILedgerFxRates",
    description: `Read-only USD FX rates for the backoffice Ledger USD-value column.

For each requested non-USD currency we call the existing read-only quote
helper (\`awesomeApi.quote.get\`, already cached) — Bitso order book for
COP/MXN/ARS, AwesomeAPI + fxratesapi fallback for BRL/EUR. This never
creates or executes a quote. A currency whose lookup fails is omitted so
one provider hiccup never fails the whole batch; the caller falls back to
\`—\` for that row.`,
    inputSchema: {"type":"object","properties":{"currencies":{"type":"string","description":"Comma-separated currency codes to fetch USD rates for. USD is ignored; unknown codes are dropped."}},"required":["currencies"]},
    method: "get",
    pathTemplate: "/i/ledger/fx-rates",
    executionParameters: [{"name":"currencies","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"Bearer":[]}]
  }],
  ["PostIOtcPullQuoteClose", {
    name: "PostIOtcPullQuoteClose",
    description: `Creates a real OTC payin from a backoffice pulled quote (receiver + blockchain wallet + amount) and executes it at the chosen liquidity provider. Mirrors the customer payin flow; respects the All-Quotes-Manual setting.`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"blockchain_wallet_id":{"type":"string"},"amount":{"type":"number","exclusiveMinimum":0},"currency":{"type":"string","enum":["BRL","USDT"]},"provider":{"type":"string","enum":["parfin","brasilbtc","ebury"]},"desk":{"type":"boolean"},"actor":{"type":"string"}},"required":["amount","currency","provider"],"description":"The JSON request body."}}},
    method: "post",
    pathTemplate: "/i/otc/pull-quote/close",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"Bearer":[]}]
  }],
]);


/**
 * Security schemes from the OpenAPI spec
 */
const securitySchemes = {
  Bearer: {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
  },
};

server.setRequestHandler(ListToolsRequestSchema, async () => {
  const toolsForClient: Tool[] = Array.from(toolDefinitionMap.values()).map((def) => ({
    name: def.name,
    description: def.description,
    inputSchema: def.inputSchema,
  }));
  return { tools: toolsForClient };
});

server.setRequestHandler(
  CallToolRequestSchema,
  async (request: CallToolRequest): Promise<CallToolResult> => {
    const { name: toolName, arguments: toolArgs } = request.params;
    const toolDefinition = toolDefinitionMap.get(toolName);
    if (!toolDefinition) {
      console.error(`Error: Unknown tool requested: ${toolName}`);
      return { content: [{ type: 'text', text: `Error: Unknown tool requested: ${toolName}` }] };
    }
    return await executeApiTool(toolName, toolDefinition, toolArgs ?? {}, securitySchemes);
  }
);

/**
 * Type definition for cached OAuth tokens
 */
interface TokenCacheEntry {
  token: string;
  expiresAt: number;
}

/**
 * Declare global __oauthTokenCache property for TypeScript
 */
declare global {
  var __oauthTokenCache: Record<string, TokenCacheEntry> | undefined;
}

/**
 * Acquires an OAuth2 token using client credentials flow
 *
 * @param schemeName Name of the security scheme
 * @param scheme OAuth2 security scheme
 * @returns Acquired token or null if unable to acquire
 */
async function acquireOAuth2Token(
  schemeName: string,
  scheme: any
): Promise<string | null | undefined> {
  try {
    // Check if we have the necessary credentials
    const clientId = process.env[`OAUTH_CLIENT_ID_SCHEMENAME`];
    const clientSecret = process.env[`OAUTH_CLIENT_SECRET_SCHEMENAME`];
    const scopes = process.env[`OAUTH_SCOPES_SCHEMENAME`];

    if (!clientId || !clientSecret) {
      console.error(`Missing client credentials for OAuth2 scheme '${schemeName}'`);
      return null;
    }

    // Initialize token cache if needed
    global.__oauthTokenCache ??= {};

    // Check if we have a cached token
    const cacheKey = `${schemeName}_${clientId}`;
    const cachedToken = global.__oauthTokenCache[cacheKey];
    const now = Date.now();

    if (cachedToken && cachedToken.expiresAt > now) {
      console.error(
        `Using cached OAuth2 token for '${schemeName}' (expires in ${Math.floor((cachedToken.expiresAt - now) / 1000)} seconds)`
      );
      return cachedToken.token;
    }

    // Determine token URL based on flow type
    let tokenUrl = '';
    if (scheme.flows?.clientCredentials?.tokenUrl) {
      tokenUrl = scheme.flows.clientCredentials.tokenUrl;
      console.error(`Using client credentials flow for '${schemeName}'`);
    } else if (scheme.flows?.password?.tokenUrl) {
      tokenUrl = scheme.flows.password.tokenUrl;
      console.error(`Using password flow for '${schemeName}'`);
    } else {
      console.error(`No supported OAuth2 flow found for '${schemeName}'`);
      return null;
    }

    // Prepare the token request
    let formData = new URLSearchParams();
    formData.append('grant_type', 'client_credentials');

    // Add scopes if specified
    if (scopes) {
      formData.append('scope', scopes);
    }

    console.error(`Requesting OAuth2 token from ${tokenUrl}`);

    // Make the token request
    const response = await axios({
      method: 'POST',
      url: tokenUrl,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      data: formData.toString(),
    });

    // Process the response
    if (response.data?.access_token) {
      const token = response.data.access_token;
      const expiresIn = response.data.expires_in || 3600; // Default to 1 hour

      // Cache the token
      global.__oauthTokenCache[cacheKey] = {
        token,
        expiresAt: now + expiresIn * 1000 - 60000, // Expire 1 minute early
      };

      console.error(
        `Successfully acquired OAuth2 token for '${schemeName}' (expires in ${expiresIn} seconds)`
      );
      return token;
    } else {
      console.error(
        `Failed to acquire OAuth2 token for '${schemeName}': No access_token in response`
      );
      return null;
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error acquiring OAuth2 token for '${schemeName}':`, errorMessage);
    return null;
  }
}

/**
 * Executes an API tool with the provided arguments
 *
 * @param toolName Name of the tool to execute
 * @param definition Tool definition
 * @param toolArgs Arguments provided by the user
 * @param allSecuritySchemes Security schemes from the OpenAPI spec
 * @returns Call tool result
 */
async function executeApiTool(
  toolName: string,
  definition: McpToolDefinition,
  toolArgs: JsonObject,
  allSecuritySchemes: Record<string, any>
): Promise<CallToolResult> {
  try {
    // Auto-inject instance_id from environment if not provided
    const defaultInstanceId = process.env.BLINDPAY_INSTANCE_ID;
    if (
      defaultInstanceId &&
      definition.inputSchema?.required?.includes('instance_id') &&
      !toolArgs.instance_id
    ) {
      toolArgs.instance_id = defaultInstanceId;
      console.error(`Auto-injected instance_id from BLINDPAY_INSTANCE_ID env var`);
    }

    // Validate arguments against the input schema
    let validatedArgs: JsonObject;
    try {
      const zodSchema = getZodSchemaFromJsonSchema(definition.inputSchema, toolName);
      const argsToParse = typeof toolArgs === 'object' && toolArgs !== null ? toolArgs : {};
      validatedArgs = zodSchema.parse(argsToParse);
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const validationErrorMessage = `Invalid arguments for tool '${toolName}': ${error.errors.map((e) => `${e.path.join('.')} (${e.code}): ${e.message}`).join(', ')}`;
        return { content: [{ type: 'text', text: validationErrorMessage }] };
      } else {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [
            { type: 'text', text: `Internal error during validation setup: ${errorMessage}` },
          ],
        };
      }
    }

    // Prepare URL, query parameters, headers, and request body
    let urlPath = definition.pathTemplate;
    const queryParams: Record<string, any> = {};
    const headers: Record<string, string> = { Accept: 'application/json' };
    let requestBodyData: any = undefined;

    // Apply parameters to the URL path, query, or headers
    definition.executionParameters.forEach((param) => {
      const value = validatedArgs[param.name];
      if (typeof value !== 'undefined' && value !== null) {
        if (param.in === 'path') {
          urlPath = urlPath.replace(`{${param.name}}`, encodeURIComponent(String(value)));
        } else if (param.in === 'query') {
          queryParams[param.name] = value;
        } else if (param.in === 'header') {
          headers[param.name.toLowerCase()] = String(value);
        }
      }
    });

    // Ensure all path parameters are resolved
    if (urlPath.includes('{')) {
      throw new Error(`Failed to resolve path parameters: ${urlPath}`);
    }

    // Construct the full URL
    const requestUrl = API_BASE_URL ? `${API_BASE_URL}${urlPath}` : urlPath;

    // Handle request body if needed
    if (definition.requestBodyContentType && typeof validatedArgs['requestBody'] !== 'undefined') {
      requestBodyData = validatedArgs['requestBody'];
      headers['content-type'] = definition.requestBodyContentType;
    }

    // Apply security requirements if available
    // Security requirements use OR between array items and AND within each object
    const appliedSecurity = definition.securityRequirements?.find((req) => {
      // Try each security requirement (combined with OR)
      return Object.entries(req).every(([schemeName, scopesArray]) => {
        const scheme = allSecuritySchemes[schemeName];
        if (!scheme) return false;

        // API Key security (header, query, cookie)
        if (scheme.type === 'apiKey') {
          return !!process.env[`API_KEY_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`];
        }

        // HTTP security (basic, bearer)
        if (scheme.type === 'http') {
          if (scheme.scheme?.toLowerCase() === 'bearer') {
            // Check for BLINDPAY_API_KEY first, then fall back to BEARER_TOKEN_{SCHEME}
            return (
              !!process.env.BLINDPAY_API_KEY ||
              !!process.env[
                `BEARER_TOKEN_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`
              ]
            );
          } else if (scheme.scheme?.toLowerCase() === 'basic') {
            return (
              !!process.env[
                `BASIC_USERNAME_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`
              ] &&
              !!process.env[
                `BASIC_PASSWORD_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`
              ]
            );
          }
        }

        // OAuth2 security
        if (scheme.type === 'oauth2') {
          // Check for pre-existing token
          if (
            process.env[`OAUTH_TOKEN_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`]
          ) {
            return true;
          }

          // Check for client credentials for auto-acquisition
          if (
            process.env[
              `OAUTH_CLIENT_ID_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`
            ] &&
            process.env[
              `OAUTH_CLIENT_SECRET_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`
            ]
          ) {
            // Verify we have a supported flow
            if (scheme.flows?.clientCredentials || scheme.flows?.password) {
              return true;
            }
          }

          return false;
        }

        // OpenID Connect
        if (scheme.type === 'openIdConnect') {
          return !!process.env[
            `OPENID_TOKEN_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`
          ];
        }

        return false;
      });
    });

    // If we found matching security scheme(s), apply them
    if (appliedSecurity) {
      // Apply each security scheme from this requirement (combined with AND)
      for (const [schemeName, scopesArray] of Object.entries(appliedSecurity)) {
        const scheme = allSecuritySchemes[schemeName];

        // API Key security
        if (scheme?.type === 'apiKey') {
          const apiKey =
            process.env[`API_KEY_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`];
          if (apiKey) {
            if (scheme.in === 'header') {
              headers[scheme.name.toLowerCase()] = apiKey;
              console.error(`Applied API key '${schemeName}' in header '${scheme.name}'`);
            } else if (scheme.in === 'query') {
              queryParams[scheme.name] = apiKey;
              console.error(`Applied API key '${schemeName}' in query parameter '${scheme.name}'`);
            } else if (scheme.in === 'cookie') {
              // Add the cookie, preserving other cookies if they exist
              headers['cookie'] =
                `${scheme.name}=${apiKey}${headers['cookie'] ? `; ${headers['cookie']}` : ''}`;
              console.error(`Applied API key '${schemeName}' in cookie '${scheme.name}'`);
            }
          }
        }
        // HTTP security (Bearer or Basic)
        else if (scheme?.type === 'http') {
          if (scheme.scheme?.toLowerCase() === 'bearer') {
            // Use BLINDPAY_API_KEY first, then fall back to BEARER_TOKEN_{SCHEME}
            const token =
              process.env.BLINDPAY_API_KEY ||
              process.env[`BEARER_TOKEN_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`];
            if (token) {
              headers['authorization'] = `Bearer ${token}`;
              console.error(`Applied Bearer token for '${schemeName}'`);
            }
          } else if (scheme.scheme?.toLowerCase() === 'basic') {
            const username =
              process.env[
                `BASIC_USERNAME_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`
              ];
            const password =
              process.env[
                `BASIC_PASSWORD_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`
              ];
            if (username && password) {
              headers['authorization'] =
                `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
              console.error(`Applied Basic authentication for '${schemeName}'`);
            }
          }
        }
        // OAuth2 security
        else if (scheme?.type === 'oauth2') {
          // First try to use a pre-provided token
          let token =
            process.env[`OAUTH_TOKEN_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`];

          // If no token but we have client credentials, try to acquire a token
          if (!token && (scheme.flows?.clientCredentials || scheme.flows?.password)) {
            console.error(`Attempting to acquire OAuth token for '${schemeName}'`);
            token = (await acquireOAuth2Token(schemeName, scheme)) ?? '';
          }

          // Apply token if available
          if (token) {
            headers['authorization'] = `Bearer ${token}`;
            console.error(`Applied OAuth2 token for '${schemeName}'`);

            // List the scopes that were requested, if any
            const scopes = scopesArray as string[];
            if (scopes && scopes.length > 0) {
              console.error(`Requested scopes: ${scopes.join(', ')}`);
            }
          }
        }
        // OpenID Connect
        else if (scheme?.type === 'openIdConnect') {
          const token =
            process.env[`OPENID_TOKEN_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`];
          if (token) {
            headers['authorization'] = `Bearer ${token}`;
            console.error(`Applied OpenID Connect token for '${schemeName}'`);

            // List the scopes that were requested, if any
            const scopes = scopesArray as string[];
            if (scopes && scopes.length > 0) {
              console.error(`Requested scopes: ${scopes.join(', ')}`);
            }
          }
        }
      }
    }
    // Log warning if security is required but not available
    else if (definition.securityRequirements?.length > 0) {
      // First generate a more readable representation of the security requirements
      const securityRequirementsString = definition.securityRequirements
        .map((req) => {
          const parts = Object.entries(req)
            .map(([name, scopesArray]) => {
              const scopes = scopesArray as string[];
              if (scopes.length === 0) return name;
              return `${name} (scopes: ${scopes.join(', ')})`;
            })
            .join(' AND ');
          return `[${parts}]`;
        })
        .join(' OR ');

      console.warn(
        `Tool '${toolName}' requires security: ${securityRequirementsString}, but no suitable credentials found.`
      );
    }

    // Prepare the axios request configuration
    const config: AxiosRequestConfig = {
      method: definition.method.toUpperCase(),
      url: requestUrl,
      params: queryParams,
      headers: headers,
      ...(requestBodyData !== undefined && { data: requestBodyData }),
    };

    // Log request info to stderr (doesn't affect MCP output)
    console.error(`Executing tool "${toolName}": ${config.method} ${config.url}`);

    // Execute the request
    const response = await axios(config);

    // Process and format the response
    let responseText = '';
    const contentType = response.headers['content-type']?.toLowerCase() || '';

    // Handle JSON responses
    if (
      contentType.includes('application/json') &&
      typeof response.data === 'object' &&
      response.data !== null
    ) {
      try {
        responseText = JSON.stringify(response.data, null, 2);
      } catch (e) {
        responseText = '[Stringify Error]';
      }
    }
    // Handle string responses
    else if (typeof response.data === 'string') {
      responseText = response.data;
    }
    // Handle other response types
    else if (response.data !== undefined && response.data !== null) {
      responseText = String(response.data);
    }
    // Handle empty responses
    else {
      responseText = `(Status: ${response.status} - No body content)`;
    }

    // Return formatted response
    return {
      content: [
        {
          type: 'text',
          text: `API Response (Status: ${response.status}):\n${responseText}`,
        },
      ],
    };
  } catch (error: unknown) {
    // Handle errors during execution
    let errorMessage: string;

    // Format Axios errors specially
    if (axios.isAxiosError(error)) {
      errorMessage = formatApiError(error);
    }
    // Handle standard errors
    else if (error instanceof Error) {
      errorMessage = error.message;
    }
    // Handle unexpected error types
    else {
      errorMessage = 'Unexpected error: ' + String(error);
    }

    // Log error to stderr
    console.error(`Error during execution of tool '${toolName}':`, errorMessage);

    // Return error message to client
    return { content: [{ type: 'text', text: errorMessage }] };
  }
}

/**
 * Main function to start the server
 */
async function main() {
  // Set up stdio transport
  try {
    const transport = new StdioServerTransport();
    await mcpServer.server.connect(transport);
    console.error(`${SERVER_NAME} MCP Server (v${SERVER_VERSION}) running on stdio`);
  } catch (error) {
    console.error('Error during server startup:', error);
    process.exit(1);
  }
}

/**
 * Cleanup function for graceful shutdown
 */
async function cleanup() {
  console.error('Shutting down MCP server...');
  process.exit(0);
}

// Register signal handlers
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Start the server
main().catch((error) => {
  console.error('Fatal error in main execution:', error);
  process.exit(1);
});

/**
 * Formats API errors for better readability
 *
 * @param error Axios error
 * @returns Formatted error message
 */
function formatApiError(error: AxiosError): string {
  let message = 'API request failed.';
  if (error.response) {
    message = `API Error: Status ${error.response.status} (${error.response.statusText || 'Status text not available'}). `;
    const responseData = error.response.data;
    const MAX_LEN = 200;
    if (typeof responseData === 'string') {
      message += `Response: ${responseData.substring(0, MAX_LEN)}${responseData.length > MAX_LEN ? '...' : ''}`;
    } else if (responseData) {
      try {
        const jsonString = JSON.stringify(responseData);
        message += `Response: ${jsonString.substring(0, MAX_LEN)}${jsonString.length > MAX_LEN ? '...' : ''}`;
      } catch {
        message += 'Response: [Could not serialize data]';
      }
    } else {
      message += 'No response body received.';
    }
  } else if (error.request) {
    message = 'API Network Error: No response received from server.';
    if (error.code) message += ` (Code: ${error.code})`;
  } else {
    message += `API Request Setup Error: ${error.message}`;
  }
  return message;
}

/**
 * Recursively converts a JSON Schema to a Zod schema for runtime validation.
 * This implementation avoids using eval() for security reasons.
 *
 * @param schema JSON Schema node
 * @param visited Set of visited $ref paths to prevent infinite recursion
 * @returns Zod schema
 */
function jsonSchemaToZodSchema(schema: any, visited: Set<string> = new Set()): z.ZodTypeAny {
  if (!schema || typeof schema !== 'object') {
    return z.any();
  }

  if (schema.$ref) {
    if (visited.has(schema.$ref)) {
      return z.any();
    }
    visited.add(schema.$ref);
  }

  if (schema.anyOf) {
    const schemas = schema.anyOf.map((s: any) => jsonSchemaToZodSchema(s, visited));
    return schemas.length > 0 ? z.union(schemas as [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]]) : z.any();
  }

  if (schema.oneOf) {
    const schemas = schema.oneOf.map((s: any) => jsonSchemaToZodSchema(s, visited));
    return schemas.length > 0 ? z.union(schemas as [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]]) : z.any();
  }

  if (schema.allOf) {
    return schema.allOf.reduce(
      (acc: z.ZodTypeAny, s: any) => acc.and(jsonSchemaToZodSchema(s, visited)),
      z.object({})
    );
  }

  if (schema.enum) {
    if (schema.enum.length === 0) return z.any();
    if (schema.enum.length === 1) return z.literal(schema.enum[0]);
    return z.enum(schema.enum as [string, ...string[]]);
  }

  if (schema.const !== undefined) {
    return z.literal(schema.const);
  }

  const type = schema.type;

  if (Array.isArray(type)) {
    const schemas = type.map((t: string) => jsonSchemaToZodSchema({ ...schema, type: t }, visited));
    return z.union(schemas as [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]]);
  }

  switch (type) {
    case 'string': {
      let s = z.string();
      if (typeof schema.minLength === 'number') s = s.min(schema.minLength);
      if (typeof schema.maxLength === 'number') s = s.max(schema.maxLength);
      if (schema.pattern) {
        try {
          s = s.regex(new RegExp(schema.pattern));
        } catch {
          // Invalid regex pattern, skip
        }
      }
      if (schema.format === 'email') s = s.email();
      if (schema.format === 'uri' || schema.format === 'url') s = s.url();
      if (schema.format === 'uuid') s = s.uuid();
      if (schema.format === 'date-time') s = s.datetime();
      return s;
    }

    case 'number':
    case 'integer': {
      let n = type === 'integer' ? z.number().int() : z.number();
      if (typeof schema.minimum === 'number') n = n.min(schema.minimum);
      if (typeof schema.maximum === 'number') n = n.max(schema.maximum);
      if (typeof schema.exclusiveMinimum === 'number') n = n.gt(schema.exclusiveMinimum);
      if (typeof schema.exclusiveMaximum === 'number') n = n.lt(schema.exclusiveMaximum);
      if (typeof schema.multipleOf === 'number') n = n.multipleOf(schema.multipleOf);
      return n;
    }

    case 'boolean':
      return z.boolean();

    case 'null':
      return z.null();

    case 'array': {
      const itemSchema = schema.items ? jsonSchemaToZodSchema(schema.items, visited) : z.any();
      let a = z.array(itemSchema);
      if (typeof schema.minItems === 'number') a = a.min(schema.minItems);
      if (typeof schema.maxItems === 'number') a = a.max(schema.maxItems);
      return a;
    }

    case 'object': {
      const properties = schema.properties || {};
      const required = new Set(schema.required || []);
      const shape: Record<string, z.ZodTypeAny> = {};

      for (const [key, propSchema] of Object.entries(properties)) {
        const propZod = jsonSchemaToZodSchema(propSchema, visited);
        shape[key] = required.has(key) ? propZod : propZod.optional();
      }

      const obj = z.object(shape);

      if (schema.additionalProperties === false) {
        return obj.strict() as z.ZodTypeAny;
      }
      return obj.passthrough() as z.ZodTypeAny;
    }

    default:
      return z.any();
  }
}

/**
 * Converts a JSON Schema to a Zod schema for runtime validation
 *
 * @param jsonSchema JSON Schema
 * @param toolName Tool name for error reporting
 * @returns Zod schema
 */
function getZodSchemaFromJsonSchema(jsonSchema: any, toolName: string): z.ZodTypeAny {
  if (typeof jsonSchema !== 'object' || jsonSchema === null) {
    return z.object({}).passthrough();
  }
  try {
    const zodSchema = jsonSchemaToZodSchema(jsonSchema);
    if (typeof zodSchema?.parse !== 'function') {
      throw new Error('Failed to produce a valid Zod schema.');
    }
    return zodSchema as z.ZodTypeAny;
  } catch (err: any) {
    console.error(`Failed to generate Zod schema for '${toolName}':`, err);
    return z.object({}).passthrough();
  }
}
