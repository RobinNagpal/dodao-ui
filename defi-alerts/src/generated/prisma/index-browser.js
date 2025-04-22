
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


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

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

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
exports.AlertCategory = exports.$Enums.AlertCategory = {
  GENERAL: 'GENERAL',
  PERSONALIZED: 'PERSONALIZED'
};

exports.AlertActionType = exports.$Enums.AlertActionType = {
  SUPPLY: 'SUPPLY',
  BORROW: 'BORROW',
  LIQUIDITY_PROVISION: 'LIQUIDITY_PROVISION'
};

exports.NotificationFrequency = exports.$Enums.NotificationFrequency = {
  IMMEDIATE: 'IMMEDIATE',
  AT_MOST_ONCE_PER_HOUR: 'AT_MOST_ONCE_PER_HOUR',
  AT_MOST_ONCE_PER_3_HOURS: 'AT_MOST_ONCE_PER_3_HOURS',
  AT_MOST_ONCE_PER_6_HOURS: 'AT_MOST_ONCE_PER_6_HOURS',
  AT_MOST_ONCE_PER_12_HOURS: 'AT_MOST_ONCE_PER_12_HOURS',
  AT_MOST_ONCE_PER_DAY: 'AT_MOST_ONCE_PER_DAY'
};

exports.Protocol = exports.$Enums.Protocol = {
  AAVE: 'AAVE',
  MORPHO: 'MORPHO',
  SPARK: 'SPARK'
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

exports.SeverityLevel = exports.$Enums.SeverityLevel = {
  NONE: 'NONE',
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH'
};

exports.DeliveryChannelType = exports.$Enums.DeliveryChannelType = {
  EMAIL: 'EMAIL',
  WEBHOOK: 'WEBHOOK'
};

exports.Prisma.ModelName = {
  User: 'User',
  Alert: 'Alert',
  AlertCondition: 'AlertCondition',
  DeliveryChannel: 'DeliveryChannel'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }

        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
