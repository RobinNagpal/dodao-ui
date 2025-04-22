
Object.defineProperty(exports, "__esModule", { value: true });

const {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
  getPrismaClient,
  sqltag,
  empty,
  join,
  raw,
  skip,
  Decimal,
  Debug,
  objectEnumValues,
  makeStrictEnum,
  Extensions,
  warnOnce,
  defineDmmfProperty,
  Public,
  getRuntime,
  createParam,
} = require('./runtime/library.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 6.6.0
 * Query Engine version: f676762280b54cd07c770017ed3711ddde35f37a
 */
Prisma.prismaVersion = {
  client: "6.6.0",
  engine: "f676762280b54cd07c770017ed3711ddde35f37a"
}

Prisma.PrismaClientKnownRequestError = PrismaClientKnownRequestError;
Prisma.PrismaClientUnknownRequestError = PrismaClientUnknownRequestError
Prisma.PrismaClientRustPanicError = PrismaClientRustPanicError
Prisma.PrismaClientInitializationError = PrismaClientInitializationError
Prisma.PrismaClientValidationError = PrismaClientValidationError
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = sqltag
Prisma.empty = empty
Prisma.join = join
Prisma.raw = raw
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = Extensions.getExtensionContext
Prisma.defineExtension = Extensions.defineExtension

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}




  const path = require('path')

/**
 * Enums
 */
exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  email: 'email'
};

exports.Prisma.AlertScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  category: 'category',
  actionType: 'actionType',
  isComparison: 'isComparison',
  walletAddress: 'walletAddress',
  selectedChains: 'selectedChains',
  selectedMarkets: 'selectedMarkets',
  compareProtocols: 'compareProtocols',
  notificationFrequency: 'notificationFrequency',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AlertConditionScalarFieldEnum = {
  id: 'id',
  alertId: 'alertId',
  conditionType: 'conditionType',
  thresholdValue: 'thresholdValue',
  thresholdValueLow: 'thresholdValueLow',
  thresholdValueHigh: 'thresholdValueHigh',
  severity: 'severity'
};

exports.Prisma.DeliveryChannelScalarFieldEnum = {
  id: 'id',
  alertId: 'alertId',
  channelType: 'channelType',
  email: 'email',
  webhookUrl: 'webhookUrl'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.Chain = exports.$Enums.Chain = {
  ETHEREUM: 'ETHEREUM',
  POLYGON: 'POLYGON',
  ARBITRUM: 'ARBITRUM',
  OPTIMISM: 'OPTIMISM'
};

exports.DeliveryChannelType = exports.$Enums.DeliveryChannelType = {
  EMAIL: 'EMAIL',
  WEBHOOK: 'WEBHOOK'
};

exports.SeverityLevel = exports.$Enums.SeverityLevel = {
  NONE: 'NONE',
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH'
};

exports.NotificationFrequency = exports.$Enums.NotificationFrequency = {
  IMMEDIATE: 'IMMEDIATE',
  AT_MOST_ONCE_PER_HOUR: 'AT_MOST_ONCE_PER_HOUR',
  AT_MOST_ONCE_PER_3_HOURS: 'AT_MOST_ONCE_PER_3_HOURS',
  AT_MOST_ONCE_PER_6_HOURS: 'AT_MOST_ONCE_PER_6_HOURS',
  AT_MOST_ONCE_PER_12_HOURS: 'AT_MOST_ONCE_PER_12_HOURS',
  AT_MOST_ONCE_PER_DAY: 'AT_MOST_ONCE_PER_DAY'
};

exports.AlertCategory = exports.$Enums.AlertCategory = {
  GENERAL: 'GENERAL',
  PERSONALIZED: 'PERSONALIZED'
};

exports.AlertActionType = exports.$Enums.AlertActionType = {
  SUPPLY: 'SUPPLY',
  BORROW: 'BORROW',
  LIQUIDITY_PROVISION: 'LIQUIDITY_PROVISION'
};

exports.ConditionType = exports.$Enums.ConditionType = {
  APR_RISE_ABOVE: 'APR_RISE_ABOVE',
  APR_FALLS_BELOW: 'APR_FALLS_BELOW',
  APR_OUTSIDE_RANGE: 'APR_OUTSIDE_RANGE',
  RATE_DIFF_ABOVE: 'RATE_DIFF_ABOVE',
  RATE_DIFF_BELOW: 'RATE_DIFF_BELOW',
  POSITION_OUT_OF_RANGE: 'POSITION_OUT_OF_RANGE',
  POSITION_BACK_IN_RANGE: 'POSITION_BACK_IN_RANGE',
  FEES_EARNED_THRESHOLD: 'FEES_EARNED_THRESHOLD',
  IMPERMANENT_LOSS_EXCEEDS: 'IMPERMANENT_LOSS_EXCEEDS'
};

exports.Protocol = exports.$Enums.Protocol = {
  AAVE: 'AAVE',
  MORPHO: 'MORPHO',
  SPARK: 'SPARK'
};

exports.Prisma.ModelName = {
  User: 'User',
  Alert: 'Alert',
  AlertCondition: 'AlertCondition',
  DeliveryChannel: 'DeliveryChannel'
};
/**
 * Create the Client
 */
const config = {
  "generator": {
    "name": "client",
    "provider": {
      "fromEnvVar": null,
      "value": "prisma-client-js"
    },
    "output": {
      "value": "C:\\Users\\hassa\\Desktop\\dodao\\dodao-ui\\defi-alerts\\src\\generated\\prisma",
      "fromEnvVar": null
    },
    "config": {
      "engineType": "library"
    },
    "binaryTargets": [
      {
        "fromEnvVar": null,
        "value": "windows",
        "native": true
      }
    ],
    "previewFeatures": [],
    "sourceFilePath": "C:\\Users\\hassa\\Desktop\\dodao\\dodao-ui\\defi-alerts\\prisma\\schema.prisma",
    "isCustomOutput": true
  },
  "relativeEnvPaths": {
    "rootEnvPath": "../../../.env",
    "schemaEnvPath": "../../../.env"
  },
  "relativePath": "../../../prisma",
  "clientVersion": "6.6.0",
  "engineVersion": "f676762280b54cd07c770017ed3711ddde35f37a",
  "datasourceNames": [
    "db"
  ],
  "activeProvider": "postgresql",
  "inlineDatasources": {
    "db": {
      "url": {
        "fromEnvVar": "DATABASE_URL",
        "value": "postgresql://admin:admin@localhost:5432/defi_alerts_db?sslmode=verify-full"
      }
    }
  },
  "inlineSchema": "// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?\n// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init\n\ngenerator client {\n  provider = \"prisma-client-js\"\n  output   = \"../src/generated/prisma\"\n}\n\ndatasource db {\n  provider = \"postgresql\"\n  url      = env(\"DATABASE_URL\")\n}\n\nenum Chain {\n  ETHEREUM\n  POLYGON\n  ARBITRUM\n  OPTIMISM\n}\n\nenum DeliveryChannelType {\n  EMAIL\n  WEBHOOK\n}\n\nenum SeverityLevel {\n  NONE\n  LOW\n  MEDIUM\n  HIGH\n}\n\nenum NotificationFrequency {\n  IMMEDIATE\n  AT_MOST_ONCE_PER_HOUR\n  AT_MOST_ONCE_PER_3_HOURS\n  AT_MOST_ONCE_PER_6_HOURS\n  AT_MOST_ONCE_PER_12_HOURS\n  AT_MOST_ONCE_PER_DAY\n}\n\nenum AlertCategory {\n  GENERAL\n  PERSONALIZED\n}\n\nenum AlertActionType {\n  SUPPLY\n  BORROW\n  LIQUIDITY_PROVISION\n}\n\nenum ConditionType {\n  APR_RISE_ABOVE\n  APR_FALLS_BELOW\n  APR_OUTSIDE_RANGE\n  RATE_DIFF_ABOVE\n  RATE_DIFF_BELOW\n  POSITION_OUT_OF_RANGE\n  POSITION_BACK_IN_RANGE\n  FEES_EARNED_THRESHOLD\n  IMPERMANENT_LOSS_EXCEEDS\n}\n\nenum Protocol {\n  AAVE\n  MORPHO\n  SPARK\n}\n\nmodel User {\n  id     String  @id @default(cuid())\n  email  String? @unique\n  alerts Alert[]\n}\n\nmodel Alert {\n  id                    String                @id @default(cuid())\n  user                  User?                 @relation(fields: [userId], references: [id])\n  userId                String?\n  category              AlertCategory\n  actionType            AlertActionType\n  isComparison          Boolean               @default(false)\n  walletAddress         String?\n  selectedChains        String[]\n  selectedMarkets       String[]\n  compareProtocols      Protocol[]\n  notificationFrequency NotificationFrequency\n  conditions            AlertCondition[]\n  deliveryChannels      DeliveryChannel[]\n  createdAt             DateTime              @default(now())\n  updatedAt             DateTime              @updatedAt\n}\n\nmodel AlertCondition {\n  id                 String        @id @default(cuid())\n  alert              Alert         @relation(fields: [alertId], references: [id])\n  alertId            String\n  conditionType      ConditionType\n  thresholdValue     Float?\n  thresholdValueLow  Float?\n  thresholdValueHigh Float?\n  severity           SeverityLevel\n}\n\nmodel DeliveryChannel {\n  id          String              @id @default(cuid())\n  alert       Alert               @relation(fields: [alertId], references: [id])\n  alertId     String\n  channelType DeliveryChannelType\n  email       String?\n  webhookUrl  String?\n}\n",
  "inlineSchemaHash": "dd13bf1cc4313a0b749f948a3158c144d4ccaf8cf81f73105b790d14f8750b4f",
  "copyEngine": true
}

const fs = require('fs')

config.dirname = __dirname
if (!fs.existsSync(path.join(__dirname, 'schema.prisma'))) {
  const alternativePaths = [
    "src/generated/prisma",
    "generated/prisma",
  ]
  
  const alternativePath = alternativePaths.find((altPath) => {
    return fs.existsSync(path.join(process.cwd(), altPath, 'schema.prisma'))
  }) ?? alternativePaths[0]

  config.dirname = path.join(process.cwd(), alternativePath)
  config.isBundled = true
}

config.runtimeDataModel = JSON.parse("{\"models\":{\"User\":{\"dbName\":null,\"schema\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"nativeType\":null,\"default\":{\"name\":\"cuid\",\"args\":[1]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"email\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"alerts\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Alert\",\"nativeType\":null,\"relationName\":\"AlertToUser\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Alert\":{\"dbName\":null,\"schema\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"nativeType\":null,\"default\":{\"name\":\"cuid\",\"args\":[1]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"nativeType\":null,\"relationName\":\"AlertToUser\",\"relationFromFields\":[\"userId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"category\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"AlertCategory\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"actionType\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"AlertActionType\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isComparison\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"nativeType\":null,\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"walletAddress\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"selectedChains\",\"kind\":\"scalar\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"selectedMarkets\",\"kind\":\"scalar\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"compareProtocols\",\"kind\":\"enum\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Protocol\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"notificationFrequency\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"NotificationFrequency\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"conditions\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"AlertCondition\",\"nativeType\":null,\"relationName\":\"AlertToAlertCondition\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deliveryChannels\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DeliveryChannel\",\"nativeType\":null,\"relationName\":\"AlertToDeliveryChannel\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"nativeType\":null,\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"AlertCondition\":{\"dbName\":null,\"schema\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"nativeType\":null,\"default\":{\"name\":\"cuid\",\"args\":[1]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"alert\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Alert\",\"nativeType\":null,\"relationName\":\"AlertToAlertCondition\",\"relationFromFields\":[\"alertId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"alertId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"conditionType\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ConditionType\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"thresholdValue\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"thresholdValueLow\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"thresholdValueHigh\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"severity\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"SeverityLevel\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"DeliveryChannel\":{\"dbName\":null,\"schema\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"nativeType\":null,\"default\":{\"name\":\"cuid\",\"args\":[1]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"alert\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Alert\",\"nativeType\":null,\"relationName\":\"AlertToDeliveryChannel\",\"relationFromFields\":[\"alertId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"alertId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"channelType\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DeliveryChannelType\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"email\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"webhookUrl\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false}},\"enums\":{\"Chain\":{\"values\":[{\"name\":\"ETHEREUM\",\"dbName\":null},{\"name\":\"POLYGON\",\"dbName\":null},{\"name\":\"ARBITRUM\",\"dbName\":null},{\"name\":\"OPTIMISM\",\"dbName\":null}],\"dbName\":null},\"DeliveryChannelType\":{\"values\":[{\"name\":\"EMAIL\",\"dbName\":null},{\"name\":\"WEBHOOK\",\"dbName\":null}],\"dbName\":null},\"SeverityLevel\":{\"values\":[{\"name\":\"NONE\",\"dbName\":null},{\"name\":\"LOW\",\"dbName\":null},{\"name\":\"MEDIUM\",\"dbName\":null},{\"name\":\"HIGH\",\"dbName\":null}],\"dbName\":null},\"NotificationFrequency\":{\"values\":[{\"name\":\"IMMEDIATE\",\"dbName\":null},{\"name\":\"AT_MOST_ONCE_PER_HOUR\",\"dbName\":null},{\"name\":\"AT_MOST_ONCE_PER_3_HOURS\",\"dbName\":null},{\"name\":\"AT_MOST_ONCE_PER_6_HOURS\",\"dbName\":null},{\"name\":\"AT_MOST_ONCE_PER_12_HOURS\",\"dbName\":null},{\"name\":\"AT_MOST_ONCE_PER_DAY\",\"dbName\":null}],\"dbName\":null},\"AlertCategory\":{\"values\":[{\"name\":\"GENERAL\",\"dbName\":null},{\"name\":\"PERSONALIZED\",\"dbName\":null}],\"dbName\":null},\"AlertActionType\":{\"values\":[{\"name\":\"SUPPLY\",\"dbName\":null},{\"name\":\"BORROW\",\"dbName\":null},{\"name\":\"LIQUIDITY_PROVISION\",\"dbName\":null}],\"dbName\":null},\"ConditionType\":{\"values\":[{\"name\":\"APR_RISE_ABOVE\",\"dbName\":null},{\"name\":\"APR_FALLS_BELOW\",\"dbName\":null},{\"name\":\"APR_OUTSIDE_RANGE\",\"dbName\":null},{\"name\":\"RATE_DIFF_ABOVE\",\"dbName\":null},{\"name\":\"RATE_DIFF_BELOW\",\"dbName\":null},{\"name\":\"POSITION_OUT_OF_RANGE\",\"dbName\":null},{\"name\":\"POSITION_BACK_IN_RANGE\",\"dbName\":null},{\"name\":\"FEES_EARNED_THRESHOLD\",\"dbName\":null},{\"name\":\"IMPERMANENT_LOSS_EXCEEDS\",\"dbName\":null}],\"dbName\":null},\"Protocol\":{\"values\":[{\"name\":\"AAVE\",\"dbName\":null},{\"name\":\"MORPHO\",\"dbName\":null},{\"name\":\"SPARK\",\"dbName\":null}],\"dbName\":null}},\"types\":{}}")
defineDmmfProperty(exports.Prisma, config.runtimeDataModel)
config.engineWasm = undefined
config.compilerWasm = undefined


const { warnEnvConflicts } = require('./runtime/library.js')

warnEnvConflicts({
    rootEnvPath: config.relativeEnvPaths.rootEnvPath && path.resolve(config.dirname, config.relativeEnvPaths.rootEnvPath),
    schemaEnvPath: config.relativeEnvPaths.schemaEnvPath && path.resolve(config.dirname, config.relativeEnvPaths.schemaEnvPath)
})

const PrismaClient = getPrismaClient(config)
exports.PrismaClient = PrismaClient
Object.assign(exports, Prisma)

// file annotations for bundling tools to include these files
path.join(__dirname, "query_engine-windows.dll.node");
path.join(process.cwd(), "src/generated/prisma/query_engine-windows.dll.node")
// file annotations for bundling tools to include these files
path.join(__dirname, "schema.prisma");
path.join(process.cwd(), "src/generated/prisma/schema.prisma")
