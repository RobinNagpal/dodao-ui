
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model Alert
 * 
 */
export type Alert = $Result.DefaultSelection<Prisma.$AlertPayload>
/**
 * Model AlertCondition
 * 
 */
export type AlertCondition = $Result.DefaultSelection<Prisma.$AlertConditionPayload>
/**
 * Model DeliveryChannel
 * 
 */
export type DeliveryChannel = $Result.DefaultSelection<Prisma.$DeliveryChannelPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const Chain: {
  ETHEREUM: 'ETHEREUM',
  POLYGON: 'POLYGON',
  ARBITRUM: 'ARBITRUM',
  OPTIMISM: 'OPTIMISM'
};

export type Chain = (typeof Chain)[keyof typeof Chain]


export const DeliveryChannelType: {
  EMAIL: 'EMAIL',
  WEBHOOK: 'WEBHOOK'
};

export type DeliveryChannelType = (typeof DeliveryChannelType)[keyof typeof DeliveryChannelType]


export const SeverityLevel: {
  NONE: 'NONE',
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH'
};

export type SeverityLevel = (typeof SeverityLevel)[keyof typeof SeverityLevel]


export const NotificationFrequency: {
  IMMEDIATE: 'IMMEDIATE',
  AT_MOST_ONCE_PER_HOUR: 'AT_MOST_ONCE_PER_HOUR',
  AT_MOST_ONCE_PER_3_HOURS: 'AT_MOST_ONCE_PER_3_HOURS',
  AT_MOST_ONCE_PER_6_HOURS: 'AT_MOST_ONCE_PER_6_HOURS',
  AT_MOST_ONCE_PER_12_HOURS: 'AT_MOST_ONCE_PER_12_HOURS',
  AT_MOST_ONCE_PER_DAY: 'AT_MOST_ONCE_PER_DAY'
};

export type NotificationFrequency = (typeof NotificationFrequency)[keyof typeof NotificationFrequency]


export const AlertCategory: {
  GENERAL: 'GENERAL',
  PERSONALIZED: 'PERSONALIZED'
};

export type AlertCategory = (typeof AlertCategory)[keyof typeof AlertCategory]


export const AlertActionType: {
  SUPPLY: 'SUPPLY',
  BORROW: 'BORROW',
  LIQUIDITY_PROVISION: 'LIQUIDITY_PROVISION'
};

export type AlertActionType = (typeof AlertActionType)[keyof typeof AlertActionType]


export const ConditionType: {
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

export type ConditionType = (typeof ConditionType)[keyof typeof ConditionType]


export const Protocol: {
  AAVE: 'AAVE',
  MORPHO: 'MORPHO',
  SPARK: 'SPARK'
};

export type Protocol = (typeof Protocol)[keyof typeof Protocol]

}

export type Chain = $Enums.Chain

export const Chain: typeof $Enums.Chain

export type DeliveryChannelType = $Enums.DeliveryChannelType

export const DeliveryChannelType: typeof $Enums.DeliveryChannelType

export type SeverityLevel = $Enums.SeverityLevel

export const SeverityLevel: typeof $Enums.SeverityLevel

export type NotificationFrequency = $Enums.NotificationFrequency

export const NotificationFrequency: typeof $Enums.NotificationFrequency

export type AlertCategory = $Enums.AlertCategory

export const AlertCategory: typeof $Enums.AlertCategory

export type AlertActionType = $Enums.AlertActionType

export const AlertActionType: typeof $Enums.AlertActionType

export type ConditionType = $Enums.ConditionType

export const ConditionType: typeof $Enums.ConditionType

export type Protocol = $Enums.Protocol

export const Protocol: typeof $Enums.Protocol

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.alert`: Exposes CRUD operations for the **Alert** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Alerts
    * const alerts = await prisma.alert.findMany()
    * ```
    */
  get alert(): Prisma.AlertDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.alertCondition`: Exposes CRUD operations for the **AlertCondition** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AlertConditions
    * const alertConditions = await prisma.alertCondition.findMany()
    * ```
    */
  get alertCondition(): Prisma.AlertConditionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.deliveryChannel`: Exposes CRUD operations for the **DeliveryChannel** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more DeliveryChannels
    * const deliveryChannels = await prisma.deliveryChannel.findMany()
    * ```
    */
  get deliveryChannel(): Prisma.DeliveryChannelDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.6.0
   * Query Engine version: f676762280b54cd07c770017ed3711ddde35f37a
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    Alert: 'Alert',
    AlertCondition: 'AlertCondition',
    DeliveryChannel: 'DeliveryChannel'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "user" | "alert" | "alertCondition" | "deliveryChannel"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      Alert: {
        payload: Prisma.$AlertPayload<ExtArgs>
        fields: Prisma.AlertFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AlertFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlertPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AlertFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlertPayload>
          }
          findFirst: {
            args: Prisma.AlertFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlertPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AlertFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlertPayload>
          }
          findMany: {
            args: Prisma.AlertFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlertPayload>[]
          }
          create: {
            args: Prisma.AlertCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlertPayload>
          }
          createMany: {
            args: Prisma.AlertCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AlertCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlertPayload>[]
          }
          delete: {
            args: Prisma.AlertDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlertPayload>
          }
          update: {
            args: Prisma.AlertUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlertPayload>
          }
          deleteMany: {
            args: Prisma.AlertDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AlertUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AlertUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlertPayload>[]
          }
          upsert: {
            args: Prisma.AlertUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlertPayload>
          }
          aggregate: {
            args: Prisma.AlertAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAlert>
          }
          groupBy: {
            args: Prisma.AlertGroupByArgs<ExtArgs>
            result: $Utils.Optional<AlertGroupByOutputType>[]
          }
          count: {
            args: Prisma.AlertCountArgs<ExtArgs>
            result: $Utils.Optional<AlertCountAggregateOutputType> | number
          }
        }
      }
      AlertCondition: {
        payload: Prisma.$AlertConditionPayload<ExtArgs>
        fields: Prisma.AlertConditionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AlertConditionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlertConditionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AlertConditionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlertConditionPayload>
          }
          findFirst: {
            args: Prisma.AlertConditionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlertConditionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AlertConditionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlertConditionPayload>
          }
          findMany: {
            args: Prisma.AlertConditionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlertConditionPayload>[]
          }
          create: {
            args: Prisma.AlertConditionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlertConditionPayload>
          }
          createMany: {
            args: Prisma.AlertConditionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AlertConditionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlertConditionPayload>[]
          }
          delete: {
            args: Prisma.AlertConditionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlertConditionPayload>
          }
          update: {
            args: Prisma.AlertConditionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlertConditionPayload>
          }
          deleteMany: {
            args: Prisma.AlertConditionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AlertConditionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AlertConditionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlertConditionPayload>[]
          }
          upsert: {
            args: Prisma.AlertConditionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AlertConditionPayload>
          }
          aggregate: {
            args: Prisma.AlertConditionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAlertCondition>
          }
          groupBy: {
            args: Prisma.AlertConditionGroupByArgs<ExtArgs>
            result: $Utils.Optional<AlertConditionGroupByOutputType>[]
          }
          count: {
            args: Prisma.AlertConditionCountArgs<ExtArgs>
            result: $Utils.Optional<AlertConditionCountAggregateOutputType> | number
          }
        }
      }
      DeliveryChannel: {
        payload: Prisma.$DeliveryChannelPayload<ExtArgs>
        fields: Prisma.DeliveryChannelFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DeliveryChannelFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeliveryChannelPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DeliveryChannelFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeliveryChannelPayload>
          }
          findFirst: {
            args: Prisma.DeliveryChannelFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeliveryChannelPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DeliveryChannelFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeliveryChannelPayload>
          }
          findMany: {
            args: Prisma.DeliveryChannelFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeliveryChannelPayload>[]
          }
          create: {
            args: Prisma.DeliveryChannelCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeliveryChannelPayload>
          }
          createMany: {
            args: Prisma.DeliveryChannelCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DeliveryChannelCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeliveryChannelPayload>[]
          }
          delete: {
            args: Prisma.DeliveryChannelDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeliveryChannelPayload>
          }
          update: {
            args: Prisma.DeliveryChannelUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeliveryChannelPayload>
          }
          deleteMany: {
            args: Prisma.DeliveryChannelDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DeliveryChannelUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.DeliveryChannelUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeliveryChannelPayload>[]
          }
          upsert: {
            args: Prisma.DeliveryChannelUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeliveryChannelPayload>
          }
          aggregate: {
            args: Prisma.DeliveryChannelAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDeliveryChannel>
          }
          groupBy: {
            args: Prisma.DeliveryChannelGroupByArgs<ExtArgs>
            result: $Utils.Optional<DeliveryChannelGroupByOutputType>[]
          }
          count: {
            args: Prisma.DeliveryChannelCountArgs<ExtArgs>
            result: $Utils.Optional<DeliveryChannelCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    user?: UserOmit
    alert?: AlertOmit
    alertCondition?: AlertConditionOmit
    deliveryChannel?: DeliveryChannelOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    alerts: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    alerts?: boolean | UserCountOutputTypeCountAlertsArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountAlertsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AlertWhereInput
  }


  /**
   * Count Type AlertCountOutputType
   */

  export type AlertCountOutputType = {
    conditions: number
    deliveryChannels: number
  }

  export type AlertCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    conditions?: boolean | AlertCountOutputTypeCountConditionsArgs
    deliveryChannels?: boolean | AlertCountOutputTypeCountDeliveryChannelsArgs
  }

  // Custom InputTypes
  /**
   * AlertCountOutputType without action
   */
  export type AlertCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlertCountOutputType
     */
    select?: AlertCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * AlertCountOutputType without action
   */
  export type AlertCountOutputTypeCountConditionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AlertConditionWhereInput
  }

  /**
   * AlertCountOutputType without action
   */
  export type AlertCountOutputTypeCountDeliveryChannelsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DeliveryChannelWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    email: string | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    email: string | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    email: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    email?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    email?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    email?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    email: string | null
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    alerts?: boolean | User$alertsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    email?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "email", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    alerts?: boolean | User$alertsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      alerts: Prisma.$AlertPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string | null
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    alerts<T extends User$alertsArgs<ExtArgs> = {}>(args?: Subset<T, User$alertsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AlertPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data?: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.alerts
   */
  export type User$alertsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Alert
     */
    select?: AlertSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Alert
     */
    omit?: AlertOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlertInclude<ExtArgs> | null
    where?: AlertWhereInput
    orderBy?: AlertOrderByWithRelationInput | AlertOrderByWithRelationInput[]
    cursor?: AlertWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AlertScalarFieldEnum | AlertScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model Alert
   */

  export type AggregateAlert = {
    _count: AlertCountAggregateOutputType | null
    _min: AlertMinAggregateOutputType | null
    _max: AlertMaxAggregateOutputType | null
  }

  export type AlertMinAggregateOutputType = {
    id: string | null
    userId: string | null
    category: $Enums.AlertCategory | null
    actionType: $Enums.AlertActionType | null
    isComparison: boolean | null
    walletAddress: string | null
    notificationFrequency: $Enums.NotificationFrequency | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AlertMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    category: $Enums.AlertCategory | null
    actionType: $Enums.AlertActionType | null
    isComparison: boolean | null
    walletAddress: string | null
    notificationFrequency: $Enums.NotificationFrequency | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AlertCountAggregateOutputType = {
    id: number
    userId: number
    category: number
    actionType: number
    isComparison: number
    walletAddress: number
    selectedChains: number
    selectedMarkets: number
    compareProtocols: number
    notificationFrequency: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type AlertMinAggregateInputType = {
    id?: true
    userId?: true
    category?: true
    actionType?: true
    isComparison?: true
    walletAddress?: true
    notificationFrequency?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AlertMaxAggregateInputType = {
    id?: true
    userId?: true
    category?: true
    actionType?: true
    isComparison?: true
    walletAddress?: true
    notificationFrequency?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AlertCountAggregateInputType = {
    id?: true
    userId?: true
    category?: true
    actionType?: true
    isComparison?: true
    walletAddress?: true
    selectedChains?: true
    selectedMarkets?: true
    compareProtocols?: true
    notificationFrequency?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type AlertAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Alert to aggregate.
     */
    where?: AlertWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Alerts to fetch.
     */
    orderBy?: AlertOrderByWithRelationInput | AlertOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AlertWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Alerts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Alerts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Alerts
    **/
    _count?: true | AlertCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AlertMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AlertMaxAggregateInputType
  }

  export type GetAlertAggregateType<T extends AlertAggregateArgs> = {
        [P in keyof T & keyof AggregateAlert]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAlert[P]>
      : GetScalarType<T[P], AggregateAlert[P]>
  }




  export type AlertGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AlertWhereInput
    orderBy?: AlertOrderByWithAggregationInput | AlertOrderByWithAggregationInput[]
    by: AlertScalarFieldEnum[] | AlertScalarFieldEnum
    having?: AlertScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AlertCountAggregateInputType | true
    _min?: AlertMinAggregateInputType
    _max?: AlertMaxAggregateInputType
  }

  export type AlertGroupByOutputType = {
    id: string
    userId: string | null
    category: $Enums.AlertCategory
    actionType: $Enums.AlertActionType
    isComparison: boolean
    walletAddress: string | null
    selectedChains: string[]
    selectedMarkets: string[]
    compareProtocols: $Enums.Protocol[]
    notificationFrequency: $Enums.NotificationFrequency
    createdAt: Date
    updatedAt: Date
    _count: AlertCountAggregateOutputType | null
    _min: AlertMinAggregateOutputType | null
    _max: AlertMaxAggregateOutputType | null
  }

  type GetAlertGroupByPayload<T extends AlertGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AlertGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AlertGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AlertGroupByOutputType[P]>
            : GetScalarType<T[P], AlertGroupByOutputType[P]>
        }
      >
    >


  export type AlertSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    category?: boolean
    actionType?: boolean
    isComparison?: boolean
    walletAddress?: boolean
    selectedChains?: boolean
    selectedMarkets?: boolean
    compareProtocols?: boolean
    notificationFrequency?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | Alert$userArgs<ExtArgs>
    conditions?: boolean | Alert$conditionsArgs<ExtArgs>
    deliveryChannels?: boolean | Alert$deliveryChannelsArgs<ExtArgs>
    _count?: boolean | AlertCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["alert"]>

  export type AlertSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    category?: boolean
    actionType?: boolean
    isComparison?: boolean
    walletAddress?: boolean
    selectedChains?: boolean
    selectedMarkets?: boolean
    compareProtocols?: boolean
    notificationFrequency?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | Alert$userArgs<ExtArgs>
  }, ExtArgs["result"]["alert"]>

  export type AlertSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    category?: boolean
    actionType?: boolean
    isComparison?: boolean
    walletAddress?: boolean
    selectedChains?: boolean
    selectedMarkets?: boolean
    compareProtocols?: boolean
    notificationFrequency?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | Alert$userArgs<ExtArgs>
  }, ExtArgs["result"]["alert"]>

  export type AlertSelectScalar = {
    id?: boolean
    userId?: boolean
    category?: boolean
    actionType?: boolean
    isComparison?: boolean
    walletAddress?: boolean
    selectedChains?: boolean
    selectedMarkets?: boolean
    compareProtocols?: boolean
    notificationFrequency?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type AlertOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "category" | "actionType" | "isComparison" | "walletAddress" | "selectedChains" | "selectedMarkets" | "compareProtocols" | "notificationFrequency" | "createdAt" | "updatedAt", ExtArgs["result"]["alert"]>
  export type AlertInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | Alert$userArgs<ExtArgs>
    conditions?: boolean | Alert$conditionsArgs<ExtArgs>
    deliveryChannels?: boolean | Alert$deliveryChannelsArgs<ExtArgs>
    _count?: boolean | AlertCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type AlertIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | Alert$userArgs<ExtArgs>
  }
  export type AlertIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | Alert$userArgs<ExtArgs>
  }

  export type $AlertPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Alert"
    objects: {
      user: Prisma.$UserPayload<ExtArgs> | null
      conditions: Prisma.$AlertConditionPayload<ExtArgs>[]
      deliveryChannels: Prisma.$DeliveryChannelPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string | null
      category: $Enums.AlertCategory
      actionType: $Enums.AlertActionType
      isComparison: boolean
      walletAddress: string | null
      selectedChains: string[]
      selectedMarkets: string[]
      compareProtocols: $Enums.Protocol[]
      notificationFrequency: $Enums.NotificationFrequency
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["alert"]>
    composites: {}
  }

  type AlertGetPayload<S extends boolean | null | undefined | AlertDefaultArgs> = $Result.GetResult<Prisma.$AlertPayload, S>

  type AlertCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AlertFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AlertCountAggregateInputType | true
    }

  export interface AlertDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Alert'], meta: { name: 'Alert' } }
    /**
     * Find zero or one Alert that matches the filter.
     * @param {AlertFindUniqueArgs} args - Arguments to find a Alert
     * @example
     * // Get one Alert
     * const alert = await prisma.alert.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AlertFindUniqueArgs>(args: SelectSubset<T, AlertFindUniqueArgs<ExtArgs>>): Prisma__AlertClient<$Result.GetResult<Prisma.$AlertPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Alert that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AlertFindUniqueOrThrowArgs} args - Arguments to find a Alert
     * @example
     * // Get one Alert
     * const alert = await prisma.alert.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AlertFindUniqueOrThrowArgs>(args: SelectSubset<T, AlertFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AlertClient<$Result.GetResult<Prisma.$AlertPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Alert that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AlertFindFirstArgs} args - Arguments to find a Alert
     * @example
     * // Get one Alert
     * const alert = await prisma.alert.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AlertFindFirstArgs>(args?: SelectSubset<T, AlertFindFirstArgs<ExtArgs>>): Prisma__AlertClient<$Result.GetResult<Prisma.$AlertPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Alert that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AlertFindFirstOrThrowArgs} args - Arguments to find a Alert
     * @example
     * // Get one Alert
     * const alert = await prisma.alert.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AlertFindFirstOrThrowArgs>(args?: SelectSubset<T, AlertFindFirstOrThrowArgs<ExtArgs>>): Prisma__AlertClient<$Result.GetResult<Prisma.$AlertPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Alerts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AlertFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Alerts
     * const alerts = await prisma.alert.findMany()
     * 
     * // Get first 10 Alerts
     * const alerts = await prisma.alert.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const alertWithIdOnly = await prisma.alert.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AlertFindManyArgs>(args?: SelectSubset<T, AlertFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AlertPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Alert.
     * @param {AlertCreateArgs} args - Arguments to create a Alert.
     * @example
     * // Create one Alert
     * const Alert = await prisma.alert.create({
     *   data: {
     *     // ... data to create a Alert
     *   }
     * })
     * 
     */
    create<T extends AlertCreateArgs>(args: SelectSubset<T, AlertCreateArgs<ExtArgs>>): Prisma__AlertClient<$Result.GetResult<Prisma.$AlertPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Alerts.
     * @param {AlertCreateManyArgs} args - Arguments to create many Alerts.
     * @example
     * // Create many Alerts
     * const alert = await prisma.alert.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AlertCreateManyArgs>(args?: SelectSubset<T, AlertCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Alerts and returns the data saved in the database.
     * @param {AlertCreateManyAndReturnArgs} args - Arguments to create many Alerts.
     * @example
     * // Create many Alerts
     * const alert = await prisma.alert.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Alerts and only return the `id`
     * const alertWithIdOnly = await prisma.alert.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AlertCreateManyAndReturnArgs>(args?: SelectSubset<T, AlertCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AlertPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Alert.
     * @param {AlertDeleteArgs} args - Arguments to delete one Alert.
     * @example
     * // Delete one Alert
     * const Alert = await prisma.alert.delete({
     *   where: {
     *     // ... filter to delete one Alert
     *   }
     * })
     * 
     */
    delete<T extends AlertDeleteArgs>(args: SelectSubset<T, AlertDeleteArgs<ExtArgs>>): Prisma__AlertClient<$Result.GetResult<Prisma.$AlertPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Alert.
     * @param {AlertUpdateArgs} args - Arguments to update one Alert.
     * @example
     * // Update one Alert
     * const alert = await prisma.alert.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AlertUpdateArgs>(args: SelectSubset<T, AlertUpdateArgs<ExtArgs>>): Prisma__AlertClient<$Result.GetResult<Prisma.$AlertPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Alerts.
     * @param {AlertDeleteManyArgs} args - Arguments to filter Alerts to delete.
     * @example
     * // Delete a few Alerts
     * const { count } = await prisma.alert.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AlertDeleteManyArgs>(args?: SelectSubset<T, AlertDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Alerts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AlertUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Alerts
     * const alert = await prisma.alert.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AlertUpdateManyArgs>(args: SelectSubset<T, AlertUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Alerts and returns the data updated in the database.
     * @param {AlertUpdateManyAndReturnArgs} args - Arguments to update many Alerts.
     * @example
     * // Update many Alerts
     * const alert = await prisma.alert.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Alerts and only return the `id`
     * const alertWithIdOnly = await prisma.alert.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AlertUpdateManyAndReturnArgs>(args: SelectSubset<T, AlertUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AlertPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Alert.
     * @param {AlertUpsertArgs} args - Arguments to update or create a Alert.
     * @example
     * // Update or create a Alert
     * const alert = await prisma.alert.upsert({
     *   create: {
     *     // ... data to create a Alert
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Alert we want to update
     *   }
     * })
     */
    upsert<T extends AlertUpsertArgs>(args: SelectSubset<T, AlertUpsertArgs<ExtArgs>>): Prisma__AlertClient<$Result.GetResult<Prisma.$AlertPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Alerts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AlertCountArgs} args - Arguments to filter Alerts to count.
     * @example
     * // Count the number of Alerts
     * const count = await prisma.alert.count({
     *   where: {
     *     // ... the filter for the Alerts we want to count
     *   }
     * })
    **/
    count<T extends AlertCountArgs>(
      args?: Subset<T, AlertCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AlertCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Alert.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AlertAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AlertAggregateArgs>(args: Subset<T, AlertAggregateArgs>): Prisma.PrismaPromise<GetAlertAggregateType<T>>

    /**
     * Group by Alert.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AlertGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AlertGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AlertGroupByArgs['orderBy'] }
        : { orderBy?: AlertGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AlertGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAlertGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Alert model
   */
  readonly fields: AlertFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Alert.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AlertClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends Alert$userArgs<ExtArgs> = {}>(args?: Subset<T, Alert$userArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    conditions<T extends Alert$conditionsArgs<ExtArgs> = {}>(args?: Subset<T, Alert$conditionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AlertConditionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    deliveryChannels<T extends Alert$deliveryChannelsArgs<ExtArgs> = {}>(args?: Subset<T, Alert$deliveryChannelsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DeliveryChannelPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Alert model
   */
  interface AlertFieldRefs {
    readonly id: FieldRef<"Alert", 'String'>
    readonly userId: FieldRef<"Alert", 'String'>
    readonly category: FieldRef<"Alert", 'AlertCategory'>
    readonly actionType: FieldRef<"Alert", 'AlertActionType'>
    readonly isComparison: FieldRef<"Alert", 'Boolean'>
    readonly walletAddress: FieldRef<"Alert", 'String'>
    readonly selectedChains: FieldRef<"Alert", 'String[]'>
    readonly selectedMarkets: FieldRef<"Alert", 'String[]'>
    readonly compareProtocols: FieldRef<"Alert", 'Protocol[]'>
    readonly notificationFrequency: FieldRef<"Alert", 'NotificationFrequency'>
    readonly createdAt: FieldRef<"Alert", 'DateTime'>
    readonly updatedAt: FieldRef<"Alert", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Alert findUnique
   */
  export type AlertFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Alert
     */
    select?: AlertSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Alert
     */
    omit?: AlertOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlertInclude<ExtArgs> | null
    /**
     * Filter, which Alert to fetch.
     */
    where: AlertWhereUniqueInput
  }

  /**
   * Alert findUniqueOrThrow
   */
  export type AlertFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Alert
     */
    select?: AlertSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Alert
     */
    omit?: AlertOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlertInclude<ExtArgs> | null
    /**
     * Filter, which Alert to fetch.
     */
    where: AlertWhereUniqueInput
  }

  /**
   * Alert findFirst
   */
  export type AlertFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Alert
     */
    select?: AlertSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Alert
     */
    omit?: AlertOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlertInclude<ExtArgs> | null
    /**
     * Filter, which Alert to fetch.
     */
    where?: AlertWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Alerts to fetch.
     */
    orderBy?: AlertOrderByWithRelationInput | AlertOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Alerts.
     */
    cursor?: AlertWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Alerts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Alerts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Alerts.
     */
    distinct?: AlertScalarFieldEnum | AlertScalarFieldEnum[]
  }

  /**
   * Alert findFirstOrThrow
   */
  export type AlertFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Alert
     */
    select?: AlertSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Alert
     */
    omit?: AlertOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlertInclude<ExtArgs> | null
    /**
     * Filter, which Alert to fetch.
     */
    where?: AlertWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Alerts to fetch.
     */
    orderBy?: AlertOrderByWithRelationInput | AlertOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Alerts.
     */
    cursor?: AlertWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Alerts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Alerts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Alerts.
     */
    distinct?: AlertScalarFieldEnum | AlertScalarFieldEnum[]
  }

  /**
   * Alert findMany
   */
  export type AlertFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Alert
     */
    select?: AlertSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Alert
     */
    omit?: AlertOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlertInclude<ExtArgs> | null
    /**
     * Filter, which Alerts to fetch.
     */
    where?: AlertWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Alerts to fetch.
     */
    orderBy?: AlertOrderByWithRelationInput | AlertOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Alerts.
     */
    cursor?: AlertWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Alerts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Alerts.
     */
    skip?: number
    distinct?: AlertScalarFieldEnum | AlertScalarFieldEnum[]
  }

  /**
   * Alert create
   */
  export type AlertCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Alert
     */
    select?: AlertSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Alert
     */
    omit?: AlertOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlertInclude<ExtArgs> | null
    /**
     * The data needed to create a Alert.
     */
    data: XOR<AlertCreateInput, AlertUncheckedCreateInput>
  }

  /**
   * Alert createMany
   */
  export type AlertCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Alerts.
     */
    data: AlertCreateManyInput | AlertCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Alert createManyAndReturn
   */
  export type AlertCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Alert
     */
    select?: AlertSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Alert
     */
    omit?: AlertOmit<ExtArgs> | null
    /**
     * The data used to create many Alerts.
     */
    data: AlertCreateManyInput | AlertCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlertIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Alert update
   */
  export type AlertUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Alert
     */
    select?: AlertSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Alert
     */
    omit?: AlertOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlertInclude<ExtArgs> | null
    /**
     * The data needed to update a Alert.
     */
    data: XOR<AlertUpdateInput, AlertUncheckedUpdateInput>
    /**
     * Choose, which Alert to update.
     */
    where: AlertWhereUniqueInput
  }

  /**
   * Alert updateMany
   */
  export type AlertUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Alerts.
     */
    data: XOR<AlertUpdateManyMutationInput, AlertUncheckedUpdateManyInput>
    /**
     * Filter which Alerts to update
     */
    where?: AlertWhereInput
    /**
     * Limit how many Alerts to update.
     */
    limit?: number
  }

  /**
   * Alert updateManyAndReturn
   */
  export type AlertUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Alert
     */
    select?: AlertSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Alert
     */
    omit?: AlertOmit<ExtArgs> | null
    /**
     * The data used to update Alerts.
     */
    data: XOR<AlertUpdateManyMutationInput, AlertUncheckedUpdateManyInput>
    /**
     * Filter which Alerts to update
     */
    where?: AlertWhereInput
    /**
     * Limit how many Alerts to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlertIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Alert upsert
   */
  export type AlertUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Alert
     */
    select?: AlertSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Alert
     */
    omit?: AlertOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlertInclude<ExtArgs> | null
    /**
     * The filter to search for the Alert to update in case it exists.
     */
    where: AlertWhereUniqueInput
    /**
     * In case the Alert found by the `where` argument doesn't exist, create a new Alert with this data.
     */
    create: XOR<AlertCreateInput, AlertUncheckedCreateInput>
    /**
     * In case the Alert was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AlertUpdateInput, AlertUncheckedUpdateInput>
  }

  /**
   * Alert delete
   */
  export type AlertDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Alert
     */
    select?: AlertSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Alert
     */
    omit?: AlertOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlertInclude<ExtArgs> | null
    /**
     * Filter which Alert to delete.
     */
    where: AlertWhereUniqueInput
  }

  /**
   * Alert deleteMany
   */
  export type AlertDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Alerts to delete
     */
    where?: AlertWhereInput
    /**
     * Limit how many Alerts to delete.
     */
    limit?: number
  }

  /**
   * Alert.user
   */
  export type Alert$userArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
  }

  /**
   * Alert.conditions
   */
  export type Alert$conditionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlertCondition
     */
    select?: AlertConditionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AlertCondition
     */
    omit?: AlertConditionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlertConditionInclude<ExtArgs> | null
    where?: AlertConditionWhereInput
    orderBy?: AlertConditionOrderByWithRelationInput | AlertConditionOrderByWithRelationInput[]
    cursor?: AlertConditionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AlertConditionScalarFieldEnum | AlertConditionScalarFieldEnum[]
  }

  /**
   * Alert.deliveryChannels
   */
  export type Alert$deliveryChannelsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeliveryChannel
     */
    select?: DeliveryChannelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DeliveryChannel
     */
    omit?: DeliveryChannelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeliveryChannelInclude<ExtArgs> | null
    where?: DeliveryChannelWhereInput
    orderBy?: DeliveryChannelOrderByWithRelationInput | DeliveryChannelOrderByWithRelationInput[]
    cursor?: DeliveryChannelWhereUniqueInput
    take?: number
    skip?: number
    distinct?: DeliveryChannelScalarFieldEnum | DeliveryChannelScalarFieldEnum[]
  }

  /**
   * Alert without action
   */
  export type AlertDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Alert
     */
    select?: AlertSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Alert
     */
    omit?: AlertOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlertInclude<ExtArgs> | null
  }


  /**
   * Model AlertCondition
   */

  export type AggregateAlertCondition = {
    _count: AlertConditionCountAggregateOutputType | null
    _avg: AlertConditionAvgAggregateOutputType | null
    _sum: AlertConditionSumAggregateOutputType | null
    _min: AlertConditionMinAggregateOutputType | null
    _max: AlertConditionMaxAggregateOutputType | null
  }

  export type AlertConditionAvgAggregateOutputType = {
    thresholdValue: number | null
    thresholdValueLow: number | null
    thresholdValueHigh: number | null
  }

  export type AlertConditionSumAggregateOutputType = {
    thresholdValue: number | null
    thresholdValueLow: number | null
    thresholdValueHigh: number | null
  }

  export type AlertConditionMinAggregateOutputType = {
    id: string | null
    alertId: string | null
    conditionType: $Enums.ConditionType | null
    thresholdValue: number | null
    thresholdValueLow: number | null
    thresholdValueHigh: number | null
    severity: $Enums.SeverityLevel | null
  }

  export type AlertConditionMaxAggregateOutputType = {
    id: string | null
    alertId: string | null
    conditionType: $Enums.ConditionType | null
    thresholdValue: number | null
    thresholdValueLow: number | null
    thresholdValueHigh: number | null
    severity: $Enums.SeverityLevel | null
  }

  export type AlertConditionCountAggregateOutputType = {
    id: number
    alertId: number
    conditionType: number
    thresholdValue: number
    thresholdValueLow: number
    thresholdValueHigh: number
    severity: number
    _all: number
  }


  export type AlertConditionAvgAggregateInputType = {
    thresholdValue?: true
    thresholdValueLow?: true
    thresholdValueHigh?: true
  }

  export type AlertConditionSumAggregateInputType = {
    thresholdValue?: true
    thresholdValueLow?: true
    thresholdValueHigh?: true
  }

  export type AlertConditionMinAggregateInputType = {
    id?: true
    alertId?: true
    conditionType?: true
    thresholdValue?: true
    thresholdValueLow?: true
    thresholdValueHigh?: true
    severity?: true
  }

  export type AlertConditionMaxAggregateInputType = {
    id?: true
    alertId?: true
    conditionType?: true
    thresholdValue?: true
    thresholdValueLow?: true
    thresholdValueHigh?: true
    severity?: true
  }

  export type AlertConditionCountAggregateInputType = {
    id?: true
    alertId?: true
    conditionType?: true
    thresholdValue?: true
    thresholdValueLow?: true
    thresholdValueHigh?: true
    severity?: true
    _all?: true
  }

  export type AlertConditionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AlertCondition to aggregate.
     */
    where?: AlertConditionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AlertConditions to fetch.
     */
    orderBy?: AlertConditionOrderByWithRelationInput | AlertConditionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AlertConditionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AlertConditions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AlertConditions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AlertConditions
    **/
    _count?: true | AlertConditionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AlertConditionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AlertConditionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AlertConditionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AlertConditionMaxAggregateInputType
  }

  export type GetAlertConditionAggregateType<T extends AlertConditionAggregateArgs> = {
        [P in keyof T & keyof AggregateAlertCondition]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAlertCondition[P]>
      : GetScalarType<T[P], AggregateAlertCondition[P]>
  }




  export type AlertConditionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AlertConditionWhereInput
    orderBy?: AlertConditionOrderByWithAggregationInput | AlertConditionOrderByWithAggregationInput[]
    by: AlertConditionScalarFieldEnum[] | AlertConditionScalarFieldEnum
    having?: AlertConditionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AlertConditionCountAggregateInputType | true
    _avg?: AlertConditionAvgAggregateInputType
    _sum?: AlertConditionSumAggregateInputType
    _min?: AlertConditionMinAggregateInputType
    _max?: AlertConditionMaxAggregateInputType
  }

  export type AlertConditionGroupByOutputType = {
    id: string
    alertId: string
    conditionType: $Enums.ConditionType
    thresholdValue: number | null
    thresholdValueLow: number | null
    thresholdValueHigh: number | null
    severity: $Enums.SeverityLevel
    _count: AlertConditionCountAggregateOutputType | null
    _avg: AlertConditionAvgAggregateOutputType | null
    _sum: AlertConditionSumAggregateOutputType | null
    _min: AlertConditionMinAggregateOutputType | null
    _max: AlertConditionMaxAggregateOutputType | null
  }

  type GetAlertConditionGroupByPayload<T extends AlertConditionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AlertConditionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AlertConditionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AlertConditionGroupByOutputType[P]>
            : GetScalarType<T[P], AlertConditionGroupByOutputType[P]>
        }
      >
    >


  export type AlertConditionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    alertId?: boolean
    conditionType?: boolean
    thresholdValue?: boolean
    thresholdValueLow?: boolean
    thresholdValueHigh?: boolean
    severity?: boolean
    alert?: boolean | AlertDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["alertCondition"]>

  export type AlertConditionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    alertId?: boolean
    conditionType?: boolean
    thresholdValue?: boolean
    thresholdValueLow?: boolean
    thresholdValueHigh?: boolean
    severity?: boolean
    alert?: boolean | AlertDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["alertCondition"]>

  export type AlertConditionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    alertId?: boolean
    conditionType?: boolean
    thresholdValue?: boolean
    thresholdValueLow?: boolean
    thresholdValueHigh?: boolean
    severity?: boolean
    alert?: boolean | AlertDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["alertCondition"]>

  export type AlertConditionSelectScalar = {
    id?: boolean
    alertId?: boolean
    conditionType?: boolean
    thresholdValue?: boolean
    thresholdValueLow?: boolean
    thresholdValueHigh?: boolean
    severity?: boolean
  }

  export type AlertConditionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "alertId" | "conditionType" | "thresholdValue" | "thresholdValueLow" | "thresholdValueHigh" | "severity", ExtArgs["result"]["alertCondition"]>
  export type AlertConditionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    alert?: boolean | AlertDefaultArgs<ExtArgs>
  }
  export type AlertConditionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    alert?: boolean | AlertDefaultArgs<ExtArgs>
  }
  export type AlertConditionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    alert?: boolean | AlertDefaultArgs<ExtArgs>
  }

  export type $AlertConditionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AlertCondition"
    objects: {
      alert: Prisma.$AlertPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      alertId: string
      conditionType: $Enums.ConditionType
      thresholdValue: number | null
      thresholdValueLow: number | null
      thresholdValueHigh: number | null
      severity: $Enums.SeverityLevel
    }, ExtArgs["result"]["alertCondition"]>
    composites: {}
  }

  type AlertConditionGetPayload<S extends boolean | null | undefined | AlertConditionDefaultArgs> = $Result.GetResult<Prisma.$AlertConditionPayload, S>

  type AlertConditionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AlertConditionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AlertConditionCountAggregateInputType | true
    }

  export interface AlertConditionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AlertCondition'], meta: { name: 'AlertCondition' } }
    /**
     * Find zero or one AlertCondition that matches the filter.
     * @param {AlertConditionFindUniqueArgs} args - Arguments to find a AlertCondition
     * @example
     * // Get one AlertCondition
     * const alertCondition = await prisma.alertCondition.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AlertConditionFindUniqueArgs>(args: SelectSubset<T, AlertConditionFindUniqueArgs<ExtArgs>>): Prisma__AlertConditionClient<$Result.GetResult<Prisma.$AlertConditionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AlertCondition that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AlertConditionFindUniqueOrThrowArgs} args - Arguments to find a AlertCondition
     * @example
     * // Get one AlertCondition
     * const alertCondition = await prisma.alertCondition.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AlertConditionFindUniqueOrThrowArgs>(args: SelectSubset<T, AlertConditionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AlertConditionClient<$Result.GetResult<Prisma.$AlertConditionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AlertCondition that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AlertConditionFindFirstArgs} args - Arguments to find a AlertCondition
     * @example
     * // Get one AlertCondition
     * const alertCondition = await prisma.alertCondition.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AlertConditionFindFirstArgs>(args?: SelectSubset<T, AlertConditionFindFirstArgs<ExtArgs>>): Prisma__AlertConditionClient<$Result.GetResult<Prisma.$AlertConditionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AlertCondition that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AlertConditionFindFirstOrThrowArgs} args - Arguments to find a AlertCondition
     * @example
     * // Get one AlertCondition
     * const alertCondition = await prisma.alertCondition.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AlertConditionFindFirstOrThrowArgs>(args?: SelectSubset<T, AlertConditionFindFirstOrThrowArgs<ExtArgs>>): Prisma__AlertConditionClient<$Result.GetResult<Prisma.$AlertConditionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AlertConditions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AlertConditionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AlertConditions
     * const alertConditions = await prisma.alertCondition.findMany()
     * 
     * // Get first 10 AlertConditions
     * const alertConditions = await prisma.alertCondition.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const alertConditionWithIdOnly = await prisma.alertCondition.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AlertConditionFindManyArgs>(args?: SelectSubset<T, AlertConditionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AlertConditionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AlertCondition.
     * @param {AlertConditionCreateArgs} args - Arguments to create a AlertCondition.
     * @example
     * // Create one AlertCondition
     * const AlertCondition = await prisma.alertCondition.create({
     *   data: {
     *     // ... data to create a AlertCondition
     *   }
     * })
     * 
     */
    create<T extends AlertConditionCreateArgs>(args: SelectSubset<T, AlertConditionCreateArgs<ExtArgs>>): Prisma__AlertConditionClient<$Result.GetResult<Prisma.$AlertConditionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AlertConditions.
     * @param {AlertConditionCreateManyArgs} args - Arguments to create many AlertConditions.
     * @example
     * // Create many AlertConditions
     * const alertCondition = await prisma.alertCondition.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AlertConditionCreateManyArgs>(args?: SelectSubset<T, AlertConditionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AlertConditions and returns the data saved in the database.
     * @param {AlertConditionCreateManyAndReturnArgs} args - Arguments to create many AlertConditions.
     * @example
     * // Create many AlertConditions
     * const alertCondition = await prisma.alertCondition.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AlertConditions and only return the `id`
     * const alertConditionWithIdOnly = await prisma.alertCondition.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AlertConditionCreateManyAndReturnArgs>(args?: SelectSubset<T, AlertConditionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AlertConditionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a AlertCondition.
     * @param {AlertConditionDeleteArgs} args - Arguments to delete one AlertCondition.
     * @example
     * // Delete one AlertCondition
     * const AlertCondition = await prisma.alertCondition.delete({
     *   where: {
     *     // ... filter to delete one AlertCondition
     *   }
     * })
     * 
     */
    delete<T extends AlertConditionDeleteArgs>(args: SelectSubset<T, AlertConditionDeleteArgs<ExtArgs>>): Prisma__AlertConditionClient<$Result.GetResult<Prisma.$AlertConditionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AlertCondition.
     * @param {AlertConditionUpdateArgs} args - Arguments to update one AlertCondition.
     * @example
     * // Update one AlertCondition
     * const alertCondition = await prisma.alertCondition.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AlertConditionUpdateArgs>(args: SelectSubset<T, AlertConditionUpdateArgs<ExtArgs>>): Prisma__AlertConditionClient<$Result.GetResult<Prisma.$AlertConditionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AlertConditions.
     * @param {AlertConditionDeleteManyArgs} args - Arguments to filter AlertConditions to delete.
     * @example
     * // Delete a few AlertConditions
     * const { count } = await prisma.alertCondition.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AlertConditionDeleteManyArgs>(args?: SelectSubset<T, AlertConditionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AlertConditions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AlertConditionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AlertConditions
     * const alertCondition = await prisma.alertCondition.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AlertConditionUpdateManyArgs>(args: SelectSubset<T, AlertConditionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AlertConditions and returns the data updated in the database.
     * @param {AlertConditionUpdateManyAndReturnArgs} args - Arguments to update many AlertConditions.
     * @example
     * // Update many AlertConditions
     * const alertCondition = await prisma.alertCondition.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more AlertConditions and only return the `id`
     * const alertConditionWithIdOnly = await prisma.alertCondition.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AlertConditionUpdateManyAndReturnArgs>(args: SelectSubset<T, AlertConditionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AlertConditionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one AlertCondition.
     * @param {AlertConditionUpsertArgs} args - Arguments to update or create a AlertCondition.
     * @example
     * // Update or create a AlertCondition
     * const alertCondition = await prisma.alertCondition.upsert({
     *   create: {
     *     // ... data to create a AlertCondition
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AlertCondition we want to update
     *   }
     * })
     */
    upsert<T extends AlertConditionUpsertArgs>(args: SelectSubset<T, AlertConditionUpsertArgs<ExtArgs>>): Prisma__AlertConditionClient<$Result.GetResult<Prisma.$AlertConditionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of AlertConditions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AlertConditionCountArgs} args - Arguments to filter AlertConditions to count.
     * @example
     * // Count the number of AlertConditions
     * const count = await prisma.alertCondition.count({
     *   where: {
     *     // ... the filter for the AlertConditions we want to count
     *   }
     * })
    **/
    count<T extends AlertConditionCountArgs>(
      args?: Subset<T, AlertConditionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AlertConditionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AlertCondition.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AlertConditionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AlertConditionAggregateArgs>(args: Subset<T, AlertConditionAggregateArgs>): Prisma.PrismaPromise<GetAlertConditionAggregateType<T>>

    /**
     * Group by AlertCondition.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AlertConditionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AlertConditionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AlertConditionGroupByArgs['orderBy'] }
        : { orderBy?: AlertConditionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AlertConditionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAlertConditionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AlertCondition model
   */
  readonly fields: AlertConditionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AlertCondition.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AlertConditionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    alert<T extends AlertDefaultArgs<ExtArgs> = {}>(args?: Subset<T, AlertDefaultArgs<ExtArgs>>): Prisma__AlertClient<$Result.GetResult<Prisma.$AlertPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AlertCondition model
   */
  interface AlertConditionFieldRefs {
    readonly id: FieldRef<"AlertCondition", 'String'>
    readonly alertId: FieldRef<"AlertCondition", 'String'>
    readonly conditionType: FieldRef<"AlertCondition", 'ConditionType'>
    readonly thresholdValue: FieldRef<"AlertCondition", 'Float'>
    readonly thresholdValueLow: FieldRef<"AlertCondition", 'Float'>
    readonly thresholdValueHigh: FieldRef<"AlertCondition", 'Float'>
    readonly severity: FieldRef<"AlertCondition", 'SeverityLevel'>
  }
    

  // Custom InputTypes
  /**
   * AlertCondition findUnique
   */
  export type AlertConditionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlertCondition
     */
    select?: AlertConditionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AlertCondition
     */
    omit?: AlertConditionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlertConditionInclude<ExtArgs> | null
    /**
     * Filter, which AlertCondition to fetch.
     */
    where: AlertConditionWhereUniqueInput
  }

  /**
   * AlertCondition findUniqueOrThrow
   */
  export type AlertConditionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlertCondition
     */
    select?: AlertConditionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AlertCondition
     */
    omit?: AlertConditionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlertConditionInclude<ExtArgs> | null
    /**
     * Filter, which AlertCondition to fetch.
     */
    where: AlertConditionWhereUniqueInput
  }

  /**
   * AlertCondition findFirst
   */
  export type AlertConditionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlertCondition
     */
    select?: AlertConditionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AlertCondition
     */
    omit?: AlertConditionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlertConditionInclude<ExtArgs> | null
    /**
     * Filter, which AlertCondition to fetch.
     */
    where?: AlertConditionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AlertConditions to fetch.
     */
    orderBy?: AlertConditionOrderByWithRelationInput | AlertConditionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AlertConditions.
     */
    cursor?: AlertConditionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AlertConditions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AlertConditions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AlertConditions.
     */
    distinct?: AlertConditionScalarFieldEnum | AlertConditionScalarFieldEnum[]
  }

  /**
   * AlertCondition findFirstOrThrow
   */
  export type AlertConditionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlertCondition
     */
    select?: AlertConditionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AlertCondition
     */
    omit?: AlertConditionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlertConditionInclude<ExtArgs> | null
    /**
     * Filter, which AlertCondition to fetch.
     */
    where?: AlertConditionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AlertConditions to fetch.
     */
    orderBy?: AlertConditionOrderByWithRelationInput | AlertConditionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AlertConditions.
     */
    cursor?: AlertConditionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AlertConditions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AlertConditions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AlertConditions.
     */
    distinct?: AlertConditionScalarFieldEnum | AlertConditionScalarFieldEnum[]
  }

  /**
   * AlertCondition findMany
   */
  export type AlertConditionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlertCondition
     */
    select?: AlertConditionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AlertCondition
     */
    omit?: AlertConditionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlertConditionInclude<ExtArgs> | null
    /**
     * Filter, which AlertConditions to fetch.
     */
    where?: AlertConditionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AlertConditions to fetch.
     */
    orderBy?: AlertConditionOrderByWithRelationInput | AlertConditionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AlertConditions.
     */
    cursor?: AlertConditionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AlertConditions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AlertConditions.
     */
    skip?: number
    distinct?: AlertConditionScalarFieldEnum | AlertConditionScalarFieldEnum[]
  }

  /**
   * AlertCondition create
   */
  export type AlertConditionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlertCondition
     */
    select?: AlertConditionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AlertCondition
     */
    omit?: AlertConditionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlertConditionInclude<ExtArgs> | null
    /**
     * The data needed to create a AlertCondition.
     */
    data: XOR<AlertConditionCreateInput, AlertConditionUncheckedCreateInput>
  }

  /**
   * AlertCondition createMany
   */
  export type AlertConditionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AlertConditions.
     */
    data: AlertConditionCreateManyInput | AlertConditionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AlertCondition createManyAndReturn
   */
  export type AlertConditionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlertCondition
     */
    select?: AlertConditionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AlertCondition
     */
    omit?: AlertConditionOmit<ExtArgs> | null
    /**
     * The data used to create many AlertConditions.
     */
    data: AlertConditionCreateManyInput | AlertConditionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlertConditionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * AlertCondition update
   */
  export type AlertConditionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlertCondition
     */
    select?: AlertConditionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AlertCondition
     */
    omit?: AlertConditionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlertConditionInclude<ExtArgs> | null
    /**
     * The data needed to update a AlertCondition.
     */
    data: XOR<AlertConditionUpdateInput, AlertConditionUncheckedUpdateInput>
    /**
     * Choose, which AlertCondition to update.
     */
    where: AlertConditionWhereUniqueInput
  }

  /**
   * AlertCondition updateMany
   */
  export type AlertConditionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AlertConditions.
     */
    data: XOR<AlertConditionUpdateManyMutationInput, AlertConditionUncheckedUpdateManyInput>
    /**
     * Filter which AlertConditions to update
     */
    where?: AlertConditionWhereInput
    /**
     * Limit how many AlertConditions to update.
     */
    limit?: number
  }

  /**
   * AlertCondition updateManyAndReturn
   */
  export type AlertConditionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlertCondition
     */
    select?: AlertConditionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AlertCondition
     */
    omit?: AlertConditionOmit<ExtArgs> | null
    /**
     * The data used to update AlertConditions.
     */
    data: XOR<AlertConditionUpdateManyMutationInput, AlertConditionUncheckedUpdateManyInput>
    /**
     * Filter which AlertConditions to update
     */
    where?: AlertConditionWhereInput
    /**
     * Limit how many AlertConditions to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlertConditionIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * AlertCondition upsert
   */
  export type AlertConditionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlertCondition
     */
    select?: AlertConditionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AlertCondition
     */
    omit?: AlertConditionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlertConditionInclude<ExtArgs> | null
    /**
     * The filter to search for the AlertCondition to update in case it exists.
     */
    where: AlertConditionWhereUniqueInput
    /**
     * In case the AlertCondition found by the `where` argument doesn't exist, create a new AlertCondition with this data.
     */
    create: XOR<AlertConditionCreateInput, AlertConditionUncheckedCreateInput>
    /**
     * In case the AlertCondition was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AlertConditionUpdateInput, AlertConditionUncheckedUpdateInput>
  }

  /**
   * AlertCondition delete
   */
  export type AlertConditionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlertCondition
     */
    select?: AlertConditionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AlertCondition
     */
    omit?: AlertConditionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlertConditionInclude<ExtArgs> | null
    /**
     * Filter which AlertCondition to delete.
     */
    where: AlertConditionWhereUniqueInput
  }

  /**
   * AlertCondition deleteMany
   */
  export type AlertConditionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AlertConditions to delete
     */
    where?: AlertConditionWhereInput
    /**
     * Limit how many AlertConditions to delete.
     */
    limit?: number
  }

  /**
   * AlertCondition without action
   */
  export type AlertConditionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AlertCondition
     */
    select?: AlertConditionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AlertCondition
     */
    omit?: AlertConditionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AlertConditionInclude<ExtArgs> | null
  }


  /**
   * Model DeliveryChannel
   */

  export type AggregateDeliveryChannel = {
    _count: DeliveryChannelCountAggregateOutputType | null
    _min: DeliveryChannelMinAggregateOutputType | null
    _max: DeliveryChannelMaxAggregateOutputType | null
  }

  export type DeliveryChannelMinAggregateOutputType = {
    id: string | null
    alertId: string | null
    channelType: $Enums.DeliveryChannelType | null
    email: string | null
    webhookUrl: string | null
  }

  export type DeliveryChannelMaxAggregateOutputType = {
    id: string | null
    alertId: string | null
    channelType: $Enums.DeliveryChannelType | null
    email: string | null
    webhookUrl: string | null
  }

  export type DeliveryChannelCountAggregateOutputType = {
    id: number
    alertId: number
    channelType: number
    email: number
    webhookUrl: number
    _all: number
  }


  export type DeliveryChannelMinAggregateInputType = {
    id?: true
    alertId?: true
    channelType?: true
    email?: true
    webhookUrl?: true
  }

  export type DeliveryChannelMaxAggregateInputType = {
    id?: true
    alertId?: true
    channelType?: true
    email?: true
    webhookUrl?: true
  }

  export type DeliveryChannelCountAggregateInputType = {
    id?: true
    alertId?: true
    channelType?: true
    email?: true
    webhookUrl?: true
    _all?: true
  }

  export type DeliveryChannelAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DeliveryChannel to aggregate.
     */
    where?: DeliveryChannelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DeliveryChannels to fetch.
     */
    orderBy?: DeliveryChannelOrderByWithRelationInput | DeliveryChannelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DeliveryChannelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DeliveryChannels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DeliveryChannels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned DeliveryChannels
    **/
    _count?: true | DeliveryChannelCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DeliveryChannelMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DeliveryChannelMaxAggregateInputType
  }

  export type GetDeliveryChannelAggregateType<T extends DeliveryChannelAggregateArgs> = {
        [P in keyof T & keyof AggregateDeliveryChannel]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDeliveryChannel[P]>
      : GetScalarType<T[P], AggregateDeliveryChannel[P]>
  }




  export type DeliveryChannelGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DeliveryChannelWhereInput
    orderBy?: DeliveryChannelOrderByWithAggregationInput | DeliveryChannelOrderByWithAggregationInput[]
    by: DeliveryChannelScalarFieldEnum[] | DeliveryChannelScalarFieldEnum
    having?: DeliveryChannelScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DeliveryChannelCountAggregateInputType | true
    _min?: DeliveryChannelMinAggregateInputType
    _max?: DeliveryChannelMaxAggregateInputType
  }

  export type DeliveryChannelGroupByOutputType = {
    id: string
    alertId: string
    channelType: $Enums.DeliveryChannelType
    email: string | null
    webhookUrl: string | null
    _count: DeliveryChannelCountAggregateOutputType | null
    _min: DeliveryChannelMinAggregateOutputType | null
    _max: DeliveryChannelMaxAggregateOutputType | null
  }

  type GetDeliveryChannelGroupByPayload<T extends DeliveryChannelGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DeliveryChannelGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DeliveryChannelGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DeliveryChannelGroupByOutputType[P]>
            : GetScalarType<T[P], DeliveryChannelGroupByOutputType[P]>
        }
      >
    >


  export type DeliveryChannelSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    alertId?: boolean
    channelType?: boolean
    email?: boolean
    webhookUrl?: boolean
    alert?: boolean | AlertDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["deliveryChannel"]>

  export type DeliveryChannelSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    alertId?: boolean
    channelType?: boolean
    email?: boolean
    webhookUrl?: boolean
    alert?: boolean | AlertDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["deliveryChannel"]>

  export type DeliveryChannelSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    alertId?: boolean
    channelType?: boolean
    email?: boolean
    webhookUrl?: boolean
    alert?: boolean | AlertDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["deliveryChannel"]>

  export type DeliveryChannelSelectScalar = {
    id?: boolean
    alertId?: boolean
    channelType?: boolean
    email?: boolean
    webhookUrl?: boolean
  }

  export type DeliveryChannelOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "alertId" | "channelType" | "email" | "webhookUrl", ExtArgs["result"]["deliveryChannel"]>
  export type DeliveryChannelInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    alert?: boolean | AlertDefaultArgs<ExtArgs>
  }
  export type DeliveryChannelIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    alert?: boolean | AlertDefaultArgs<ExtArgs>
  }
  export type DeliveryChannelIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    alert?: boolean | AlertDefaultArgs<ExtArgs>
  }

  export type $DeliveryChannelPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "DeliveryChannel"
    objects: {
      alert: Prisma.$AlertPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      alertId: string
      channelType: $Enums.DeliveryChannelType
      email: string | null
      webhookUrl: string | null
    }, ExtArgs["result"]["deliveryChannel"]>
    composites: {}
  }

  type DeliveryChannelGetPayload<S extends boolean | null | undefined | DeliveryChannelDefaultArgs> = $Result.GetResult<Prisma.$DeliveryChannelPayload, S>

  type DeliveryChannelCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DeliveryChannelFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DeliveryChannelCountAggregateInputType | true
    }

  export interface DeliveryChannelDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['DeliveryChannel'], meta: { name: 'DeliveryChannel' } }
    /**
     * Find zero or one DeliveryChannel that matches the filter.
     * @param {DeliveryChannelFindUniqueArgs} args - Arguments to find a DeliveryChannel
     * @example
     * // Get one DeliveryChannel
     * const deliveryChannel = await prisma.deliveryChannel.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DeliveryChannelFindUniqueArgs>(args: SelectSubset<T, DeliveryChannelFindUniqueArgs<ExtArgs>>): Prisma__DeliveryChannelClient<$Result.GetResult<Prisma.$DeliveryChannelPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one DeliveryChannel that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DeliveryChannelFindUniqueOrThrowArgs} args - Arguments to find a DeliveryChannel
     * @example
     * // Get one DeliveryChannel
     * const deliveryChannel = await prisma.deliveryChannel.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DeliveryChannelFindUniqueOrThrowArgs>(args: SelectSubset<T, DeliveryChannelFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DeliveryChannelClient<$Result.GetResult<Prisma.$DeliveryChannelPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DeliveryChannel that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeliveryChannelFindFirstArgs} args - Arguments to find a DeliveryChannel
     * @example
     * // Get one DeliveryChannel
     * const deliveryChannel = await prisma.deliveryChannel.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DeliveryChannelFindFirstArgs>(args?: SelectSubset<T, DeliveryChannelFindFirstArgs<ExtArgs>>): Prisma__DeliveryChannelClient<$Result.GetResult<Prisma.$DeliveryChannelPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DeliveryChannel that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeliveryChannelFindFirstOrThrowArgs} args - Arguments to find a DeliveryChannel
     * @example
     * // Get one DeliveryChannel
     * const deliveryChannel = await prisma.deliveryChannel.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DeliveryChannelFindFirstOrThrowArgs>(args?: SelectSubset<T, DeliveryChannelFindFirstOrThrowArgs<ExtArgs>>): Prisma__DeliveryChannelClient<$Result.GetResult<Prisma.$DeliveryChannelPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more DeliveryChannels that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeliveryChannelFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DeliveryChannels
     * const deliveryChannels = await prisma.deliveryChannel.findMany()
     * 
     * // Get first 10 DeliveryChannels
     * const deliveryChannels = await prisma.deliveryChannel.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const deliveryChannelWithIdOnly = await prisma.deliveryChannel.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DeliveryChannelFindManyArgs>(args?: SelectSubset<T, DeliveryChannelFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DeliveryChannelPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a DeliveryChannel.
     * @param {DeliveryChannelCreateArgs} args - Arguments to create a DeliveryChannel.
     * @example
     * // Create one DeliveryChannel
     * const DeliveryChannel = await prisma.deliveryChannel.create({
     *   data: {
     *     // ... data to create a DeliveryChannel
     *   }
     * })
     * 
     */
    create<T extends DeliveryChannelCreateArgs>(args: SelectSubset<T, DeliveryChannelCreateArgs<ExtArgs>>): Prisma__DeliveryChannelClient<$Result.GetResult<Prisma.$DeliveryChannelPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many DeliveryChannels.
     * @param {DeliveryChannelCreateManyArgs} args - Arguments to create many DeliveryChannels.
     * @example
     * // Create many DeliveryChannels
     * const deliveryChannel = await prisma.deliveryChannel.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DeliveryChannelCreateManyArgs>(args?: SelectSubset<T, DeliveryChannelCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many DeliveryChannels and returns the data saved in the database.
     * @param {DeliveryChannelCreateManyAndReturnArgs} args - Arguments to create many DeliveryChannels.
     * @example
     * // Create many DeliveryChannels
     * const deliveryChannel = await prisma.deliveryChannel.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many DeliveryChannels and only return the `id`
     * const deliveryChannelWithIdOnly = await prisma.deliveryChannel.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DeliveryChannelCreateManyAndReturnArgs>(args?: SelectSubset<T, DeliveryChannelCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DeliveryChannelPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a DeliveryChannel.
     * @param {DeliveryChannelDeleteArgs} args - Arguments to delete one DeliveryChannel.
     * @example
     * // Delete one DeliveryChannel
     * const DeliveryChannel = await prisma.deliveryChannel.delete({
     *   where: {
     *     // ... filter to delete one DeliveryChannel
     *   }
     * })
     * 
     */
    delete<T extends DeliveryChannelDeleteArgs>(args: SelectSubset<T, DeliveryChannelDeleteArgs<ExtArgs>>): Prisma__DeliveryChannelClient<$Result.GetResult<Prisma.$DeliveryChannelPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one DeliveryChannel.
     * @param {DeliveryChannelUpdateArgs} args - Arguments to update one DeliveryChannel.
     * @example
     * // Update one DeliveryChannel
     * const deliveryChannel = await prisma.deliveryChannel.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DeliveryChannelUpdateArgs>(args: SelectSubset<T, DeliveryChannelUpdateArgs<ExtArgs>>): Prisma__DeliveryChannelClient<$Result.GetResult<Prisma.$DeliveryChannelPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more DeliveryChannels.
     * @param {DeliveryChannelDeleteManyArgs} args - Arguments to filter DeliveryChannels to delete.
     * @example
     * // Delete a few DeliveryChannels
     * const { count } = await prisma.deliveryChannel.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DeliveryChannelDeleteManyArgs>(args?: SelectSubset<T, DeliveryChannelDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DeliveryChannels.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeliveryChannelUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DeliveryChannels
     * const deliveryChannel = await prisma.deliveryChannel.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DeliveryChannelUpdateManyArgs>(args: SelectSubset<T, DeliveryChannelUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DeliveryChannels and returns the data updated in the database.
     * @param {DeliveryChannelUpdateManyAndReturnArgs} args - Arguments to update many DeliveryChannels.
     * @example
     * // Update many DeliveryChannels
     * const deliveryChannel = await prisma.deliveryChannel.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more DeliveryChannels and only return the `id`
     * const deliveryChannelWithIdOnly = await prisma.deliveryChannel.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends DeliveryChannelUpdateManyAndReturnArgs>(args: SelectSubset<T, DeliveryChannelUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DeliveryChannelPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one DeliveryChannel.
     * @param {DeliveryChannelUpsertArgs} args - Arguments to update or create a DeliveryChannel.
     * @example
     * // Update or create a DeliveryChannel
     * const deliveryChannel = await prisma.deliveryChannel.upsert({
     *   create: {
     *     // ... data to create a DeliveryChannel
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DeliveryChannel we want to update
     *   }
     * })
     */
    upsert<T extends DeliveryChannelUpsertArgs>(args: SelectSubset<T, DeliveryChannelUpsertArgs<ExtArgs>>): Prisma__DeliveryChannelClient<$Result.GetResult<Prisma.$DeliveryChannelPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of DeliveryChannels.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeliveryChannelCountArgs} args - Arguments to filter DeliveryChannels to count.
     * @example
     * // Count the number of DeliveryChannels
     * const count = await prisma.deliveryChannel.count({
     *   where: {
     *     // ... the filter for the DeliveryChannels we want to count
     *   }
     * })
    **/
    count<T extends DeliveryChannelCountArgs>(
      args?: Subset<T, DeliveryChannelCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DeliveryChannelCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a DeliveryChannel.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeliveryChannelAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DeliveryChannelAggregateArgs>(args: Subset<T, DeliveryChannelAggregateArgs>): Prisma.PrismaPromise<GetDeliveryChannelAggregateType<T>>

    /**
     * Group by DeliveryChannel.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeliveryChannelGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DeliveryChannelGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DeliveryChannelGroupByArgs['orderBy'] }
        : { orderBy?: DeliveryChannelGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DeliveryChannelGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDeliveryChannelGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the DeliveryChannel model
   */
  readonly fields: DeliveryChannelFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for DeliveryChannel.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DeliveryChannelClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    alert<T extends AlertDefaultArgs<ExtArgs> = {}>(args?: Subset<T, AlertDefaultArgs<ExtArgs>>): Prisma__AlertClient<$Result.GetResult<Prisma.$AlertPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the DeliveryChannel model
   */
  interface DeliveryChannelFieldRefs {
    readonly id: FieldRef<"DeliveryChannel", 'String'>
    readonly alertId: FieldRef<"DeliveryChannel", 'String'>
    readonly channelType: FieldRef<"DeliveryChannel", 'DeliveryChannelType'>
    readonly email: FieldRef<"DeliveryChannel", 'String'>
    readonly webhookUrl: FieldRef<"DeliveryChannel", 'String'>
  }
    

  // Custom InputTypes
  /**
   * DeliveryChannel findUnique
   */
  export type DeliveryChannelFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeliveryChannel
     */
    select?: DeliveryChannelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DeliveryChannel
     */
    omit?: DeliveryChannelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeliveryChannelInclude<ExtArgs> | null
    /**
     * Filter, which DeliveryChannel to fetch.
     */
    where: DeliveryChannelWhereUniqueInput
  }

  /**
   * DeliveryChannel findUniqueOrThrow
   */
  export type DeliveryChannelFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeliveryChannel
     */
    select?: DeliveryChannelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DeliveryChannel
     */
    omit?: DeliveryChannelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeliveryChannelInclude<ExtArgs> | null
    /**
     * Filter, which DeliveryChannel to fetch.
     */
    where: DeliveryChannelWhereUniqueInput
  }

  /**
   * DeliveryChannel findFirst
   */
  export type DeliveryChannelFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeliveryChannel
     */
    select?: DeliveryChannelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DeliveryChannel
     */
    omit?: DeliveryChannelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeliveryChannelInclude<ExtArgs> | null
    /**
     * Filter, which DeliveryChannel to fetch.
     */
    where?: DeliveryChannelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DeliveryChannels to fetch.
     */
    orderBy?: DeliveryChannelOrderByWithRelationInput | DeliveryChannelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DeliveryChannels.
     */
    cursor?: DeliveryChannelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DeliveryChannels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DeliveryChannels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DeliveryChannels.
     */
    distinct?: DeliveryChannelScalarFieldEnum | DeliveryChannelScalarFieldEnum[]
  }

  /**
   * DeliveryChannel findFirstOrThrow
   */
  export type DeliveryChannelFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeliveryChannel
     */
    select?: DeliveryChannelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DeliveryChannel
     */
    omit?: DeliveryChannelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeliveryChannelInclude<ExtArgs> | null
    /**
     * Filter, which DeliveryChannel to fetch.
     */
    where?: DeliveryChannelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DeliveryChannels to fetch.
     */
    orderBy?: DeliveryChannelOrderByWithRelationInput | DeliveryChannelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DeliveryChannels.
     */
    cursor?: DeliveryChannelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DeliveryChannels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DeliveryChannels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DeliveryChannels.
     */
    distinct?: DeliveryChannelScalarFieldEnum | DeliveryChannelScalarFieldEnum[]
  }

  /**
   * DeliveryChannel findMany
   */
  export type DeliveryChannelFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeliveryChannel
     */
    select?: DeliveryChannelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DeliveryChannel
     */
    omit?: DeliveryChannelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeliveryChannelInclude<ExtArgs> | null
    /**
     * Filter, which DeliveryChannels to fetch.
     */
    where?: DeliveryChannelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DeliveryChannels to fetch.
     */
    orderBy?: DeliveryChannelOrderByWithRelationInput | DeliveryChannelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing DeliveryChannels.
     */
    cursor?: DeliveryChannelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DeliveryChannels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DeliveryChannels.
     */
    skip?: number
    distinct?: DeliveryChannelScalarFieldEnum | DeliveryChannelScalarFieldEnum[]
  }

  /**
   * DeliveryChannel create
   */
  export type DeliveryChannelCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeliveryChannel
     */
    select?: DeliveryChannelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DeliveryChannel
     */
    omit?: DeliveryChannelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeliveryChannelInclude<ExtArgs> | null
    /**
     * The data needed to create a DeliveryChannel.
     */
    data: XOR<DeliveryChannelCreateInput, DeliveryChannelUncheckedCreateInput>
  }

  /**
   * DeliveryChannel createMany
   */
  export type DeliveryChannelCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many DeliveryChannels.
     */
    data: DeliveryChannelCreateManyInput | DeliveryChannelCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DeliveryChannel createManyAndReturn
   */
  export type DeliveryChannelCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeliveryChannel
     */
    select?: DeliveryChannelSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DeliveryChannel
     */
    omit?: DeliveryChannelOmit<ExtArgs> | null
    /**
     * The data used to create many DeliveryChannels.
     */
    data: DeliveryChannelCreateManyInput | DeliveryChannelCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeliveryChannelIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * DeliveryChannel update
   */
  export type DeliveryChannelUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeliveryChannel
     */
    select?: DeliveryChannelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DeliveryChannel
     */
    omit?: DeliveryChannelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeliveryChannelInclude<ExtArgs> | null
    /**
     * The data needed to update a DeliveryChannel.
     */
    data: XOR<DeliveryChannelUpdateInput, DeliveryChannelUncheckedUpdateInput>
    /**
     * Choose, which DeliveryChannel to update.
     */
    where: DeliveryChannelWhereUniqueInput
  }

  /**
   * DeliveryChannel updateMany
   */
  export type DeliveryChannelUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update DeliveryChannels.
     */
    data: XOR<DeliveryChannelUpdateManyMutationInput, DeliveryChannelUncheckedUpdateManyInput>
    /**
     * Filter which DeliveryChannels to update
     */
    where?: DeliveryChannelWhereInput
    /**
     * Limit how many DeliveryChannels to update.
     */
    limit?: number
  }

  /**
   * DeliveryChannel updateManyAndReturn
   */
  export type DeliveryChannelUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeliveryChannel
     */
    select?: DeliveryChannelSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DeliveryChannel
     */
    omit?: DeliveryChannelOmit<ExtArgs> | null
    /**
     * The data used to update DeliveryChannels.
     */
    data: XOR<DeliveryChannelUpdateManyMutationInput, DeliveryChannelUncheckedUpdateManyInput>
    /**
     * Filter which DeliveryChannels to update
     */
    where?: DeliveryChannelWhereInput
    /**
     * Limit how many DeliveryChannels to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeliveryChannelIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * DeliveryChannel upsert
   */
  export type DeliveryChannelUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeliveryChannel
     */
    select?: DeliveryChannelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DeliveryChannel
     */
    omit?: DeliveryChannelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeliveryChannelInclude<ExtArgs> | null
    /**
     * The filter to search for the DeliveryChannel to update in case it exists.
     */
    where: DeliveryChannelWhereUniqueInput
    /**
     * In case the DeliveryChannel found by the `where` argument doesn't exist, create a new DeliveryChannel with this data.
     */
    create: XOR<DeliveryChannelCreateInput, DeliveryChannelUncheckedCreateInput>
    /**
     * In case the DeliveryChannel was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DeliveryChannelUpdateInput, DeliveryChannelUncheckedUpdateInput>
  }

  /**
   * DeliveryChannel delete
   */
  export type DeliveryChannelDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeliveryChannel
     */
    select?: DeliveryChannelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DeliveryChannel
     */
    omit?: DeliveryChannelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeliveryChannelInclude<ExtArgs> | null
    /**
     * Filter which DeliveryChannel to delete.
     */
    where: DeliveryChannelWhereUniqueInput
  }

  /**
   * DeliveryChannel deleteMany
   */
  export type DeliveryChannelDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DeliveryChannels to delete
     */
    where?: DeliveryChannelWhereInput
    /**
     * Limit how many DeliveryChannels to delete.
     */
    limit?: number
  }

  /**
   * DeliveryChannel without action
   */
  export type DeliveryChannelDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeliveryChannel
     */
    select?: DeliveryChannelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DeliveryChannel
     */
    omit?: DeliveryChannelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeliveryChannelInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    email: 'email'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const AlertScalarFieldEnum: {
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

  export type AlertScalarFieldEnum = (typeof AlertScalarFieldEnum)[keyof typeof AlertScalarFieldEnum]


  export const AlertConditionScalarFieldEnum: {
    id: 'id',
    alertId: 'alertId',
    conditionType: 'conditionType',
    thresholdValue: 'thresholdValue',
    thresholdValueLow: 'thresholdValueLow',
    thresholdValueHigh: 'thresholdValueHigh',
    severity: 'severity'
  };

  export type AlertConditionScalarFieldEnum = (typeof AlertConditionScalarFieldEnum)[keyof typeof AlertConditionScalarFieldEnum]


  export const DeliveryChannelScalarFieldEnum: {
    id: 'id',
    alertId: 'alertId',
    channelType: 'channelType',
    email: 'email',
    webhookUrl: 'webhookUrl'
  };

  export type DeliveryChannelScalarFieldEnum = (typeof DeliveryChannelScalarFieldEnum)[keyof typeof DeliveryChannelScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'AlertCategory'
   */
  export type EnumAlertCategoryFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AlertCategory'>
    


  /**
   * Reference to a field of type 'AlertCategory[]'
   */
  export type ListEnumAlertCategoryFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AlertCategory[]'>
    


  /**
   * Reference to a field of type 'AlertActionType'
   */
  export type EnumAlertActionTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AlertActionType'>
    


  /**
   * Reference to a field of type 'AlertActionType[]'
   */
  export type ListEnumAlertActionTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AlertActionType[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Protocol[]'
   */
  export type ListEnumProtocolFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Protocol[]'>
    


  /**
   * Reference to a field of type 'Protocol'
   */
  export type EnumProtocolFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Protocol'>
    


  /**
   * Reference to a field of type 'NotificationFrequency'
   */
  export type EnumNotificationFrequencyFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'NotificationFrequency'>
    


  /**
   * Reference to a field of type 'NotificationFrequency[]'
   */
  export type ListEnumNotificationFrequencyFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'NotificationFrequency[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'ConditionType'
   */
  export type EnumConditionTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ConditionType'>
    


  /**
   * Reference to a field of type 'ConditionType[]'
   */
  export type ListEnumConditionTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ConditionType[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'SeverityLevel'
   */
  export type EnumSeverityLevelFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SeverityLevel'>
    


  /**
   * Reference to a field of type 'SeverityLevel[]'
   */
  export type ListEnumSeverityLevelFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SeverityLevel[]'>
    


  /**
   * Reference to a field of type 'DeliveryChannelType'
   */
  export type EnumDeliveryChannelTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DeliveryChannelType'>
    


  /**
   * Reference to a field of type 'DeliveryChannelType[]'
   */
  export type ListEnumDeliveryChannelTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DeliveryChannelType[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    email?: StringNullableFilter<"User"> | string | null
    alerts?: AlertListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrderInput | SortOrder
    alerts?: AlertOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    alerts?: AlertListRelationFilter
  }, "id" | "email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrderInput | SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    email?: StringNullableWithAggregatesFilter<"User"> | string | null
  }

  export type AlertWhereInput = {
    AND?: AlertWhereInput | AlertWhereInput[]
    OR?: AlertWhereInput[]
    NOT?: AlertWhereInput | AlertWhereInput[]
    id?: StringFilter<"Alert"> | string
    userId?: StringNullableFilter<"Alert"> | string | null
    category?: EnumAlertCategoryFilter<"Alert"> | $Enums.AlertCategory
    actionType?: EnumAlertActionTypeFilter<"Alert"> | $Enums.AlertActionType
    isComparison?: BoolFilter<"Alert"> | boolean
    walletAddress?: StringNullableFilter<"Alert"> | string | null
    selectedChains?: StringNullableListFilter<"Alert">
    selectedMarkets?: StringNullableListFilter<"Alert">
    compareProtocols?: EnumProtocolNullableListFilter<"Alert">
    notificationFrequency?: EnumNotificationFrequencyFilter<"Alert"> | $Enums.NotificationFrequency
    createdAt?: DateTimeFilter<"Alert"> | Date | string
    updatedAt?: DateTimeFilter<"Alert"> | Date | string
    user?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
    conditions?: AlertConditionListRelationFilter
    deliveryChannels?: DeliveryChannelListRelationFilter
  }

  export type AlertOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrderInput | SortOrder
    category?: SortOrder
    actionType?: SortOrder
    isComparison?: SortOrder
    walletAddress?: SortOrderInput | SortOrder
    selectedChains?: SortOrder
    selectedMarkets?: SortOrder
    compareProtocols?: SortOrder
    notificationFrequency?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    user?: UserOrderByWithRelationInput
    conditions?: AlertConditionOrderByRelationAggregateInput
    deliveryChannels?: DeliveryChannelOrderByRelationAggregateInput
  }

  export type AlertWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: AlertWhereInput | AlertWhereInput[]
    OR?: AlertWhereInput[]
    NOT?: AlertWhereInput | AlertWhereInput[]
    userId?: StringNullableFilter<"Alert"> | string | null
    category?: EnumAlertCategoryFilter<"Alert"> | $Enums.AlertCategory
    actionType?: EnumAlertActionTypeFilter<"Alert"> | $Enums.AlertActionType
    isComparison?: BoolFilter<"Alert"> | boolean
    walletAddress?: StringNullableFilter<"Alert"> | string | null
    selectedChains?: StringNullableListFilter<"Alert">
    selectedMarkets?: StringNullableListFilter<"Alert">
    compareProtocols?: EnumProtocolNullableListFilter<"Alert">
    notificationFrequency?: EnumNotificationFrequencyFilter<"Alert"> | $Enums.NotificationFrequency
    createdAt?: DateTimeFilter<"Alert"> | Date | string
    updatedAt?: DateTimeFilter<"Alert"> | Date | string
    user?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
    conditions?: AlertConditionListRelationFilter
    deliveryChannels?: DeliveryChannelListRelationFilter
  }, "id">

  export type AlertOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrderInput | SortOrder
    category?: SortOrder
    actionType?: SortOrder
    isComparison?: SortOrder
    walletAddress?: SortOrderInput | SortOrder
    selectedChains?: SortOrder
    selectedMarkets?: SortOrder
    compareProtocols?: SortOrder
    notificationFrequency?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: AlertCountOrderByAggregateInput
    _max?: AlertMaxOrderByAggregateInput
    _min?: AlertMinOrderByAggregateInput
  }

  export type AlertScalarWhereWithAggregatesInput = {
    AND?: AlertScalarWhereWithAggregatesInput | AlertScalarWhereWithAggregatesInput[]
    OR?: AlertScalarWhereWithAggregatesInput[]
    NOT?: AlertScalarWhereWithAggregatesInput | AlertScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Alert"> | string
    userId?: StringNullableWithAggregatesFilter<"Alert"> | string | null
    category?: EnumAlertCategoryWithAggregatesFilter<"Alert"> | $Enums.AlertCategory
    actionType?: EnumAlertActionTypeWithAggregatesFilter<"Alert"> | $Enums.AlertActionType
    isComparison?: BoolWithAggregatesFilter<"Alert"> | boolean
    walletAddress?: StringNullableWithAggregatesFilter<"Alert"> | string | null
    selectedChains?: StringNullableListFilter<"Alert">
    selectedMarkets?: StringNullableListFilter<"Alert">
    compareProtocols?: EnumProtocolNullableListFilter<"Alert">
    notificationFrequency?: EnumNotificationFrequencyWithAggregatesFilter<"Alert"> | $Enums.NotificationFrequency
    createdAt?: DateTimeWithAggregatesFilter<"Alert"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Alert"> | Date | string
  }

  export type AlertConditionWhereInput = {
    AND?: AlertConditionWhereInput | AlertConditionWhereInput[]
    OR?: AlertConditionWhereInput[]
    NOT?: AlertConditionWhereInput | AlertConditionWhereInput[]
    id?: StringFilter<"AlertCondition"> | string
    alertId?: StringFilter<"AlertCondition"> | string
    conditionType?: EnumConditionTypeFilter<"AlertCondition"> | $Enums.ConditionType
    thresholdValue?: FloatNullableFilter<"AlertCondition"> | number | null
    thresholdValueLow?: FloatNullableFilter<"AlertCondition"> | number | null
    thresholdValueHigh?: FloatNullableFilter<"AlertCondition"> | number | null
    severity?: EnumSeverityLevelFilter<"AlertCondition"> | $Enums.SeverityLevel
    alert?: XOR<AlertScalarRelationFilter, AlertWhereInput>
  }

  export type AlertConditionOrderByWithRelationInput = {
    id?: SortOrder
    alertId?: SortOrder
    conditionType?: SortOrder
    thresholdValue?: SortOrderInput | SortOrder
    thresholdValueLow?: SortOrderInput | SortOrder
    thresholdValueHigh?: SortOrderInput | SortOrder
    severity?: SortOrder
    alert?: AlertOrderByWithRelationInput
  }

  export type AlertConditionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: AlertConditionWhereInput | AlertConditionWhereInput[]
    OR?: AlertConditionWhereInput[]
    NOT?: AlertConditionWhereInput | AlertConditionWhereInput[]
    alertId?: StringFilter<"AlertCondition"> | string
    conditionType?: EnumConditionTypeFilter<"AlertCondition"> | $Enums.ConditionType
    thresholdValue?: FloatNullableFilter<"AlertCondition"> | number | null
    thresholdValueLow?: FloatNullableFilter<"AlertCondition"> | number | null
    thresholdValueHigh?: FloatNullableFilter<"AlertCondition"> | number | null
    severity?: EnumSeverityLevelFilter<"AlertCondition"> | $Enums.SeverityLevel
    alert?: XOR<AlertScalarRelationFilter, AlertWhereInput>
  }, "id">

  export type AlertConditionOrderByWithAggregationInput = {
    id?: SortOrder
    alertId?: SortOrder
    conditionType?: SortOrder
    thresholdValue?: SortOrderInput | SortOrder
    thresholdValueLow?: SortOrderInput | SortOrder
    thresholdValueHigh?: SortOrderInput | SortOrder
    severity?: SortOrder
    _count?: AlertConditionCountOrderByAggregateInput
    _avg?: AlertConditionAvgOrderByAggregateInput
    _max?: AlertConditionMaxOrderByAggregateInput
    _min?: AlertConditionMinOrderByAggregateInput
    _sum?: AlertConditionSumOrderByAggregateInput
  }

  export type AlertConditionScalarWhereWithAggregatesInput = {
    AND?: AlertConditionScalarWhereWithAggregatesInput | AlertConditionScalarWhereWithAggregatesInput[]
    OR?: AlertConditionScalarWhereWithAggregatesInput[]
    NOT?: AlertConditionScalarWhereWithAggregatesInput | AlertConditionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"AlertCondition"> | string
    alertId?: StringWithAggregatesFilter<"AlertCondition"> | string
    conditionType?: EnumConditionTypeWithAggregatesFilter<"AlertCondition"> | $Enums.ConditionType
    thresholdValue?: FloatNullableWithAggregatesFilter<"AlertCondition"> | number | null
    thresholdValueLow?: FloatNullableWithAggregatesFilter<"AlertCondition"> | number | null
    thresholdValueHigh?: FloatNullableWithAggregatesFilter<"AlertCondition"> | number | null
    severity?: EnumSeverityLevelWithAggregatesFilter<"AlertCondition"> | $Enums.SeverityLevel
  }

  export type DeliveryChannelWhereInput = {
    AND?: DeliveryChannelWhereInput | DeliveryChannelWhereInput[]
    OR?: DeliveryChannelWhereInput[]
    NOT?: DeliveryChannelWhereInput | DeliveryChannelWhereInput[]
    id?: StringFilter<"DeliveryChannel"> | string
    alertId?: StringFilter<"DeliveryChannel"> | string
    channelType?: EnumDeliveryChannelTypeFilter<"DeliveryChannel"> | $Enums.DeliveryChannelType
    email?: StringNullableFilter<"DeliveryChannel"> | string | null
    webhookUrl?: StringNullableFilter<"DeliveryChannel"> | string | null
    alert?: XOR<AlertScalarRelationFilter, AlertWhereInput>
  }

  export type DeliveryChannelOrderByWithRelationInput = {
    id?: SortOrder
    alertId?: SortOrder
    channelType?: SortOrder
    email?: SortOrderInput | SortOrder
    webhookUrl?: SortOrderInput | SortOrder
    alert?: AlertOrderByWithRelationInput
  }

  export type DeliveryChannelWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: DeliveryChannelWhereInput | DeliveryChannelWhereInput[]
    OR?: DeliveryChannelWhereInput[]
    NOT?: DeliveryChannelWhereInput | DeliveryChannelWhereInput[]
    alertId?: StringFilter<"DeliveryChannel"> | string
    channelType?: EnumDeliveryChannelTypeFilter<"DeliveryChannel"> | $Enums.DeliveryChannelType
    email?: StringNullableFilter<"DeliveryChannel"> | string | null
    webhookUrl?: StringNullableFilter<"DeliveryChannel"> | string | null
    alert?: XOR<AlertScalarRelationFilter, AlertWhereInput>
  }, "id">

  export type DeliveryChannelOrderByWithAggregationInput = {
    id?: SortOrder
    alertId?: SortOrder
    channelType?: SortOrder
    email?: SortOrderInput | SortOrder
    webhookUrl?: SortOrderInput | SortOrder
    _count?: DeliveryChannelCountOrderByAggregateInput
    _max?: DeliveryChannelMaxOrderByAggregateInput
    _min?: DeliveryChannelMinOrderByAggregateInput
  }

  export type DeliveryChannelScalarWhereWithAggregatesInput = {
    AND?: DeliveryChannelScalarWhereWithAggregatesInput | DeliveryChannelScalarWhereWithAggregatesInput[]
    OR?: DeliveryChannelScalarWhereWithAggregatesInput[]
    NOT?: DeliveryChannelScalarWhereWithAggregatesInput | DeliveryChannelScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"DeliveryChannel"> | string
    alertId?: StringWithAggregatesFilter<"DeliveryChannel"> | string
    channelType?: EnumDeliveryChannelTypeWithAggregatesFilter<"DeliveryChannel"> | $Enums.DeliveryChannelType
    email?: StringNullableWithAggregatesFilter<"DeliveryChannel"> | string | null
    webhookUrl?: StringNullableWithAggregatesFilter<"DeliveryChannel"> | string | null
  }

  export type UserCreateInput = {
    id?: string
    email?: string | null
    alerts?: AlertCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    email?: string | null
    alerts?: AlertUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    alerts?: AlertUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    alerts?: AlertUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    email?: string | null
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type AlertCreateInput = {
    id?: string
    category: $Enums.AlertCategory
    actionType: $Enums.AlertActionType
    isComparison?: boolean
    walletAddress?: string | null
    selectedChains?: AlertCreateselectedChainsInput | string[]
    selectedMarkets?: AlertCreateselectedMarketsInput | string[]
    compareProtocols?: AlertCreatecompareProtocolsInput | $Enums.Protocol[]
    notificationFrequency: $Enums.NotificationFrequency
    createdAt?: Date | string
    updatedAt?: Date | string
    user?: UserCreateNestedOneWithoutAlertsInput
    conditions?: AlertConditionCreateNestedManyWithoutAlertInput
    deliveryChannels?: DeliveryChannelCreateNestedManyWithoutAlertInput
  }

  export type AlertUncheckedCreateInput = {
    id?: string
    userId?: string | null
    category: $Enums.AlertCategory
    actionType: $Enums.AlertActionType
    isComparison?: boolean
    walletAddress?: string | null
    selectedChains?: AlertCreateselectedChainsInput | string[]
    selectedMarkets?: AlertCreateselectedMarketsInput | string[]
    compareProtocols?: AlertCreatecompareProtocolsInput | $Enums.Protocol[]
    notificationFrequency: $Enums.NotificationFrequency
    createdAt?: Date | string
    updatedAt?: Date | string
    conditions?: AlertConditionUncheckedCreateNestedManyWithoutAlertInput
    deliveryChannels?: DeliveryChannelUncheckedCreateNestedManyWithoutAlertInput
  }

  export type AlertUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    category?: EnumAlertCategoryFieldUpdateOperationsInput | $Enums.AlertCategory
    actionType?: EnumAlertActionTypeFieldUpdateOperationsInput | $Enums.AlertActionType
    isComparison?: BoolFieldUpdateOperationsInput | boolean
    walletAddress?: NullableStringFieldUpdateOperationsInput | string | null
    selectedChains?: AlertUpdateselectedChainsInput | string[]
    selectedMarkets?: AlertUpdateselectedMarketsInput | string[]
    compareProtocols?: AlertUpdatecompareProtocolsInput | $Enums.Protocol[]
    notificationFrequency?: EnumNotificationFrequencyFieldUpdateOperationsInput | $Enums.NotificationFrequency
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneWithoutAlertsNestedInput
    conditions?: AlertConditionUpdateManyWithoutAlertNestedInput
    deliveryChannels?: DeliveryChannelUpdateManyWithoutAlertNestedInput
  }

  export type AlertUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    category?: EnumAlertCategoryFieldUpdateOperationsInput | $Enums.AlertCategory
    actionType?: EnumAlertActionTypeFieldUpdateOperationsInput | $Enums.AlertActionType
    isComparison?: BoolFieldUpdateOperationsInput | boolean
    walletAddress?: NullableStringFieldUpdateOperationsInput | string | null
    selectedChains?: AlertUpdateselectedChainsInput | string[]
    selectedMarkets?: AlertUpdateselectedMarketsInput | string[]
    compareProtocols?: AlertUpdatecompareProtocolsInput | $Enums.Protocol[]
    notificationFrequency?: EnumNotificationFrequencyFieldUpdateOperationsInput | $Enums.NotificationFrequency
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    conditions?: AlertConditionUncheckedUpdateManyWithoutAlertNestedInput
    deliveryChannels?: DeliveryChannelUncheckedUpdateManyWithoutAlertNestedInput
  }

  export type AlertCreateManyInput = {
    id?: string
    userId?: string | null
    category: $Enums.AlertCategory
    actionType: $Enums.AlertActionType
    isComparison?: boolean
    walletAddress?: string | null
    selectedChains?: AlertCreateselectedChainsInput | string[]
    selectedMarkets?: AlertCreateselectedMarketsInput | string[]
    compareProtocols?: AlertCreatecompareProtocolsInput | $Enums.Protocol[]
    notificationFrequency: $Enums.NotificationFrequency
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AlertUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    category?: EnumAlertCategoryFieldUpdateOperationsInput | $Enums.AlertCategory
    actionType?: EnumAlertActionTypeFieldUpdateOperationsInput | $Enums.AlertActionType
    isComparison?: BoolFieldUpdateOperationsInput | boolean
    walletAddress?: NullableStringFieldUpdateOperationsInput | string | null
    selectedChains?: AlertUpdateselectedChainsInput | string[]
    selectedMarkets?: AlertUpdateselectedMarketsInput | string[]
    compareProtocols?: AlertUpdatecompareProtocolsInput | $Enums.Protocol[]
    notificationFrequency?: EnumNotificationFrequencyFieldUpdateOperationsInput | $Enums.NotificationFrequency
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AlertUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    category?: EnumAlertCategoryFieldUpdateOperationsInput | $Enums.AlertCategory
    actionType?: EnumAlertActionTypeFieldUpdateOperationsInput | $Enums.AlertActionType
    isComparison?: BoolFieldUpdateOperationsInput | boolean
    walletAddress?: NullableStringFieldUpdateOperationsInput | string | null
    selectedChains?: AlertUpdateselectedChainsInput | string[]
    selectedMarkets?: AlertUpdateselectedMarketsInput | string[]
    compareProtocols?: AlertUpdatecompareProtocolsInput | $Enums.Protocol[]
    notificationFrequency?: EnumNotificationFrequencyFieldUpdateOperationsInput | $Enums.NotificationFrequency
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AlertConditionCreateInput = {
    id?: string
    conditionType: $Enums.ConditionType
    thresholdValue?: number | null
    thresholdValueLow?: number | null
    thresholdValueHigh?: number | null
    severity: $Enums.SeverityLevel
    alert: AlertCreateNestedOneWithoutConditionsInput
  }

  export type AlertConditionUncheckedCreateInput = {
    id?: string
    alertId: string
    conditionType: $Enums.ConditionType
    thresholdValue?: number | null
    thresholdValueLow?: number | null
    thresholdValueHigh?: number | null
    severity: $Enums.SeverityLevel
  }

  export type AlertConditionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    conditionType?: EnumConditionTypeFieldUpdateOperationsInput | $Enums.ConditionType
    thresholdValue?: NullableFloatFieldUpdateOperationsInput | number | null
    thresholdValueLow?: NullableFloatFieldUpdateOperationsInput | number | null
    thresholdValueHigh?: NullableFloatFieldUpdateOperationsInput | number | null
    severity?: EnumSeverityLevelFieldUpdateOperationsInput | $Enums.SeverityLevel
    alert?: AlertUpdateOneRequiredWithoutConditionsNestedInput
  }

  export type AlertConditionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    alertId?: StringFieldUpdateOperationsInput | string
    conditionType?: EnumConditionTypeFieldUpdateOperationsInput | $Enums.ConditionType
    thresholdValue?: NullableFloatFieldUpdateOperationsInput | number | null
    thresholdValueLow?: NullableFloatFieldUpdateOperationsInput | number | null
    thresholdValueHigh?: NullableFloatFieldUpdateOperationsInput | number | null
    severity?: EnumSeverityLevelFieldUpdateOperationsInput | $Enums.SeverityLevel
  }

  export type AlertConditionCreateManyInput = {
    id?: string
    alertId: string
    conditionType: $Enums.ConditionType
    thresholdValue?: number | null
    thresholdValueLow?: number | null
    thresholdValueHigh?: number | null
    severity: $Enums.SeverityLevel
  }

  export type AlertConditionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    conditionType?: EnumConditionTypeFieldUpdateOperationsInput | $Enums.ConditionType
    thresholdValue?: NullableFloatFieldUpdateOperationsInput | number | null
    thresholdValueLow?: NullableFloatFieldUpdateOperationsInput | number | null
    thresholdValueHigh?: NullableFloatFieldUpdateOperationsInput | number | null
    severity?: EnumSeverityLevelFieldUpdateOperationsInput | $Enums.SeverityLevel
  }

  export type AlertConditionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    alertId?: StringFieldUpdateOperationsInput | string
    conditionType?: EnumConditionTypeFieldUpdateOperationsInput | $Enums.ConditionType
    thresholdValue?: NullableFloatFieldUpdateOperationsInput | number | null
    thresholdValueLow?: NullableFloatFieldUpdateOperationsInput | number | null
    thresholdValueHigh?: NullableFloatFieldUpdateOperationsInput | number | null
    severity?: EnumSeverityLevelFieldUpdateOperationsInput | $Enums.SeverityLevel
  }

  export type DeliveryChannelCreateInput = {
    id?: string
    channelType: $Enums.DeliveryChannelType
    email?: string | null
    webhookUrl?: string | null
    alert: AlertCreateNestedOneWithoutDeliveryChannelsInput
  }

  export type DeliveryChannelUncheckedCreateInput = {
    id?: string
    alertId: string
    channelType: $Enums.DeliveryChannelType
    email?: string | null
    webhookUrl?: string | null
  }

  export type DeliveryChannelUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    channelType?: EnumDeliveryChannelTypeFieldUpdateOperationsInput | $Enums.DeliveryChannelType
    email?: NullableStringFieldUpdateOperationsInput | string | null
    webhookUrl?: NullableStringFieldUpdateOperationsInput | string | null
    alert?: AlertUpdateOneRequiredWithoutDeliveryChannelsNestedInput
  }

  export type DeliveryChannelUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    alertId?: StringFieldUpdateOperationsInput | string
    channelType?: EnumDeliveryChannelTypeFieldUpdateOperationsInput | $Enums.DeliveryChannelType
    email?: NullableStringFieldUpdateOperationsInput | string | null
    webhookUrl?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type DeliveryChannelCreateManyInput = {
    id?: string
    alertId: string
    channelType: $Enums.DeliveryChannelType
    email?: string | null
    webhookUrl?: string | null
  }

  export type DeliveryChannelUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    channelType?: EnumDeliveryChannelTypeFieldUpdateOperationsInput | $Enums.DeliveryChannelType
    email?: NullableStringFieldUpdateOperationsInput | string | null
    webhookUrl?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type DeliveryChannelUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    alertId?: StringFieldUpdateOperationsInput | string
    channelType?: EnumDeliveryChannelTypeFieldUpdateOperationsInput | $Enums.DeliveryChannelType
    email?: NullableStringFieldUpdateOperationsInput | string | null
    webhookUrl?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type AlertListRelationFilter = {
    every?: AlertWhereInput
    some?: AlertWhereInput
    none?: AlertWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type AlertOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type EnumAlertCategoryFilter<$PrismaModel = never> = {
    equals?: $Enums.AlertCategory | EnumAlertCategoryFieldRefInput<$PrismaModel>
    in?: $Enums.AlertCategory[] | ListEnumAlertCategoryFieldRefInput<$PrismaModel>
    notIn?: $Enums.AlertCategory[] | ListEnumAlertCategoryFieldRefInput<$PrismaModel>
    not?: NestedEnumAlertCategoryFilter<$PrismaModel> | $Enums.AlertCategory
  }

  export type EnumAlertActionTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.AlertActionType | EnumAlertActionTypeFieldRefInput<$PrismaModel>
    in?: $Enums.AlertActionType[] | ListEnumAlertActionTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.AlertActionType[] | ListEnumAlertActionTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumAlertActionTypeFilter<$PrismaModel> | $Enums.AlertActionType
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    has?: string | StringFieldRefInput<$PrismaModel> | null
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type EnumProtocolNullableListFilter<$PrismaModel = never> = {
    equals?: $Enums.Protocol[] | ListEnumProtocolFieldRefInput<$PrismaModel> | null
    has?: $Enums.Protocol | EnumProtocolFieldRefInput<$PrismaModel> | null
    hasEvery?: $Enums.Protocol[] | ListEnumProtocolFieldRefInput<$PrismaModel>
    hasSome?: $Enums.Protocol[] | ListEnumProtocolFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type EnumNotificationFrequencyFilter<$PrismaModel = never> = {
    equals?: $Enums.NotificationFrequency | EnumNotificationFrequencyFieldRefInput<$PrismaModel>
    in?: $Enums.NotificationFrequency[] | ListEnumNotificationFrequencyFieldRefInput<$PrismaModel>
    notIn?: $Enums.NotificationFrequency[] | ListEnumNotificationFrequencyFieldRefInput<$PrismaModel>
    not?: NestedEnumNotificationFrequencyFilter<$PrismaModel> | $Enums.NotificationFrequency
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type UserNullableScalarRelationFilter = {
    is?: UserWhereInput | null
    isNot?: UserWhereInput | null
  }

  export type AlertConditionListRelationFilter = {
    every?: AlertConditionWhereInput
    some?: AlertConditionWhereInput
    none?: AlertConditionWhereInput
  }

  export type DeliveryChannelListRelationFilter = {
    every?: DeliveryChannelWhereInput
    some?: DeliveryChannelWhereInput
    none?: DeliveryChannelWhereInput
  }

  export type AlertConditionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type DeliveryChannelOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AlertCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    category?: SortOrder
    actionType?: SortOrder
    isComparison?: SortOrder
    walletAddress?: SortOrder
    selectedChains?: SortOrder
    selectedMarkets?: SortOrder
    compareProtocols?: SortOrder
    notificationFrequency?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AlertMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    category?: SortOrder
    actionType?: SortOrder
    isComparison?: SortOrder
    walletAddress?: SortOrder
    notificationFrequency?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AlertMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    category?: SortOrder
    actionType?: SortOrder
    isComparison?: SortOrder
    walletAddress?: SortOrder
    notificationFrequency?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumAlertCategoryWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AlertCategory | EnumAlertCategoryFieldRefInput<$PrismaModel>
    in?: $Enums.AlertCategory[] | ListEnumAlertCategoryFieldRefInput<$PrismaModel>
    notIn?: $Enums.AlertCategory[] | ListEnumAlertCategoryFieldRefInput<$PrismaModel>
    not?: NestedEnumAlertCategoryWithAggregatesFilter<$PrismaModel> | $Enums.AlertCategory
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAlertCategoryFilter<$PrismaModel>
    _max?: NestedEnumAlertCategoryFilter<$PrismaModel>
  }

  export type EnumAlertActionTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AlertActionType | EnumAlertActionTypeFieldRefInput<$PrismaModel>
    in?: $Enums.AlertActionType[] | ListEnumAlertActionTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.AlertActionType[] | ListEnumAlertActionTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumAlertActionTypeWithAggregatesFilter<$PrismaModel> | $Enums.AlertActionType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAlertActionTypeFilter<$PrismaModel>
    _max?: NestedEnumAlertActionTypeFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type EnumNotificationFrequencyWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.NotificationFrequency | EnumNotificationFrequencyFieldRefInput<$PrismaModel>
    in?: $Enums.NotificationFrequency[] | ListEnumNotificationFrequencyFieldRefInput<$PrismaModel>
    notIn?: $Enums.NotificationFrequency[] | ListEnumNotificationFrequencyFieldRefInput<$PrismaModel>
    not?: NestedEnumNotificationFrequencyWithAggregatesFilter<$PrismaModel> | $Enums.NotificationFrequency
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumNotificationFrequencyFilter<$PrismaModel>
    _max?: NestedEnumNotificationFrequencyFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type EnumConditionTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.ConditionType | EnumConditionTypeFieldRefInput<$PrismaModel>
    in?: $Enums.ConditionType[] | ListEnumConditionTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ConditionType[] | ListEnumConditionTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumConditionTypeFilter<$PrismaModel> | $Enums.ConditionType
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type EnumSeverityLevelFilter<$PrismaModel = never> = {
    equals?: $Enums.SeverityLevel | EnumSeverityLevelFieldRefInput<$PrismaModel>
    in?: $Enums.SeverityLevel[] | ListEnumSeverityLevelFieldRefInput<$PrismaModel>
    notIn?: $Enums.SeverityLevel[] | ListEnumSeverityLevelFieldRefInput<$PrismaModel>
    not?: NestedEnumSeverityLevelFilter<$PrismaModel> | $Enums.SeverityLevel
  }

  export type AlertScalarRelationFilter = {
    is?: AlertWhereInput
    isNot?: AlertWhereInput
  }

  export type AlertConditionCountOrderByAggregateInput = {
    id?: SortOrder
    alertId?: SortOrder
    conditionType?: SortOrder
    thresholdValue?: SortOrder
    thresholdValueLow?: SortOrder
    thresholdValueHigh?: SortOrder
    severity?: SortOrder
  }

  export type AlertConditionAvgOrderByAggregateInput = {
    thresholdValue?: SortOrder
    thresholdValueLow?: SortOrder
    thresholdValueHigh?: SortOrder
  }

  export type AlertConditionMaxOrderByAggregateInput = {
    id?: SortOrder
    alertId?: SortOrder
    conditionType?: SortOrder
    thresholdValue?: SortOrder
    thresholdValueLow?: SortOrder
    thresholdValueHigh?: SortOrder
    severity?: SortOrder
  }

  export type AlertConditionMinOrderByAggregateInput = {
    id?: SortOrder
    alertId?: SortOrder
    conditionType?: SortOrder
    thresholdValue?: SortOrder
    thresholdValueLow?: SortOrder
    thresholdValueHigh?: SortOrder
    severity?: SortOrder
  }

  export type AlertConditionSumOrderByAggregateInput = {
    thresholdValue?: SortOrder
    thresholdValueLow?: SortOrder
    thresholdValueHigh?: SortOrder
  }

  export type EnumConditionTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ConditionType | EnumConditionTypeFieldRefInput<$PrismaModel>
    in?: $Enums.ConditionType[] | ListEnumConditionTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ConditionType[] | ListEnumConditionTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumConditionTypeWithAggregatesFilter<$PrismaModel> | $Enums.ConditionType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumConditionTypeFilter<$PrismaModel>
    _max?: NestedEnumConditionTypeFilter<$PrismaModel>
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type EnumSeverityLevelWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SeverityLevel | EnumSeverityLevelFieldRefInput<$PrismaModel>
    in?: $Enums.SeverityLevel[] | ListEnumSeverityLevelFieldRefInput<$PrismaModel>
    notIn?: $Enums.SeverityLevel[] | ListEnumSeverityLevelFieldRefInput<$PrismaModel>
    not?: NestedEnumSeverityLevelWithAggregatesFilter<$PrismaModel> | $Enums.SeverityLevel
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSeverityLevelFilter<$PrismaModel>
    _max?: NestedEnumSeverityLevelFilter<$PrismaModel>
  }

  export type EnumDeliveryChannelTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.DeliveryChannelType | EnumDeliveryChannelTypeFieldRefInput<$PrismaModel>
    in?: $Enums.DeliveryChannelType[] | ListEnumDeliveryChannelTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.DeliveryChannelType[] | ListEnumDeliveryChannelTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumDeliveryChannelTypeFilter<$PrismaModel> | $Enums.DeliveryChannelType
  }

  export type DeliveryChannelCountOrderByAggregateInput = {
    id?: SortOrder
    alertId?: SortOrder
    channelType?: SortOrder
    email?: SortOrder
    webhookUrl?: SortOrder
  }

  export type DeliveryChannelMaxOrderByAggregateInput = {
    id?: SortOrder
    alertId?: SortOrder
    channelType?: SortOrder
    email?: SortOrder
    webhookUrl?: SortOrder
  }

  export type DeliveryChannelMinOrderByAggregateInput = {
    id?: SortOrder
    alertId?: SortOrder
    channelType?: SortOrder
    email?: SortOrder
    webhookUrl?: SortOrder
  }

  export type EnumDeliveryChannelTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.DeliveryChannelType | EnumDeliveryChannelTypeFieldRefInput<$PrismaModel>
    in?: $Enums.DeliveryChannelType[] | ListEnumDeliveryChannelTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.DeliveryChannelType[] | ListEnumDeliveryChannelTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumDeliveryChannelTypeWithAggregatesFilter<$PrismaModel> | $Enums.DeliveryChannelType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumDeliveryChannelTypeFilter<$PrismaModel>
    _max?: NestedEnumDeliveryChannelTypeFilter<$PrismaModel>
  }

  export type AlertCreateNestedManyWithoutUserInput = {
    create?: XOR<AlertCreateWithoutUserInput, AlertUncheckedCreateWithoutUserInput> | AlertCreateWithoutUserInput[] | AlertUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AlertCreateOrConnectWithoutUserInput | AlertCreateOrConnectWithoutUserInput[]
    createMany?: AlertCreateManyUserInputEnvelope
    connect?: AlertWhereUniqueInput | AlertWhereUniqueInput[]
  }

  export type AlertUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<AlertCreateWithoutUserInput, AlertUncheckedCreateWithoutUserInput> | AlertCreateWithoutUserInput[] | AlertUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AlertCreateOrConnectWithoutUserInput | AlertCreateOrConnectWithoutUserInput[]
    createMany?: AlertCreateManyUserInputEnvelope
    connect?: AlertWhereUniqueInput | AlertWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type AlertUpdateManyWithoutUserNestedInput = {
    create?: XOR<AlertCreateWithoutUserInput, AlertUncheckedCreateWithoutUserInput> | AlertCreateWithoutUserInput[] | AlertUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AlertCreateOrConnectWithoutUserInput | AlertCreateOrConnectWithoutUserInput[]
    upsert?: AlertUpsertWithWhereUniqueWithoutUserInput | AlertUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: AlertCreateManyUserInputEnvelope
    set?: AlertWhereUniqueInput | AlertWhereUniqueInput[]
    disconnect?: AlertWhereUniqueInput | AlertWhereUniqueInput[]
    delete?: AlertWhereUniqueInput | AlertWhereUniqueInput[]
    connect?: AlertWhereUniqueInput | AlertWhereUniqueInput[]
    update?: AlertUpdateWithWhereUniqueWithoutUserInput | AlertUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: AlertUpdateManyWithWhereWithoutUserInput | AlertUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: AlertScalarWhereInput | AlertScalarWhereInput[]
  }

  export type AlertUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<AlertCreateWithoutUserInput, AlertUncheckedCreateWithoutUserInput> | AlertCreateWithoutUserInput[] | AlertUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AlertCreateOrConnectWithoutUserInput | AlertCreateOrConnectWithoutUserInput[]
    upsert?: AlertUpsertWithWhereUniqueWithoutUserInput | AlertUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: AlertCreateManyUserInputEnvelope
    set?: AlertWhereUniqueInput | AlertWhereUniqueInput[]
    disconnect?: AlertWhereUniqueInput | AlertWhereUniqueInput[]
    delete?: AlertWhereUniqueInput | AlertWhereUniqueInput[]
    connect?: AlertWhereUniqueInput | AlertWhereUniqueInput[]
    update?: AlertUpdateWithWhereUniqueWithoutUserInput | AlertUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: AlertUpdateManyWithWhereWithoutUserInput | AlertUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: AlertScalarWhereInput | AlertScalarWhereInput[]
  }

  export type AlertCreateselectedChainsInput = {
    set: string[]
  }

  export type AlertCreateselectedMarketsInput = {
    set: string[]
  }

  export type AlertCreatecompareProtocolsInput = {
    set: $Enums.Protocol[]
  }

  export type UserCreateNestedOneWithoutAlertsInput = {
    create?: XOR<UserCreateWithoutAlertsInput, UserUncheckedCreateWithoutAlertsInput>
    connectOrCreate?: UserCreateOrConnectWithoutAlertsInput
    connect?: UserWhereUniqueInput
  }

  export type AlertConditionCreateNestedManyWithoutAlertInput = {
    create?: XOR<AlertConditionCreateWithoutAlertInput, AlertConditionUncheckedCreateWithoutAlertInput> | AlertConditionCreateWithoutAlertInput[] | AlertConditionUncheckedCreateWithoutAlertInput[]
    connectOrCreate?: AlertConditionCreateOrConnectWithoutAlertInput | AlertConditionCreateOrConnectWithoutAlertInput[]
    createMany?: AlertConditionCreateManyAlertInputEnvelope
    connect?: AlertConditionWhereUniqueInput | AlertConditionWhereUniqueInput[]
  }

  export type DeliveryChannelCreateNestedManyWithoutAlertInput = {
    create?: XOR<DeliveryChannelCreateWithoutAlertInput, DeliveryChannelUncheckedCreateWithoutAlertInput> | DeliveryChannelCreateWithoutAlertInput[] | DeliveryChannelUncheckedCreateWithoutAlertInput[]
    connectOrCreate?: DeliveryChannelCreateOrConnectWithoutAlertInput | DeliveryChannelCreateOrConnectWithoutAlertInput[]
    createMany?: DeliveryChannelCreateManyAlertInputEnvelope
    connect?: DeliveryChannelWhereUniqueInput | DeliveryChannelWhereUniqueInput[]
  }

  export type AlertConditionUncheckedCreateNestedManyWithoutAlertInput = {
    create?: XOR<AlertConditionCreateWithoutAlertInput, AlertConditionUncheckedCreateWithoutAlertInput> | AlertConditionCreateWithoutAlertInput[] | AlertConditionUncheckedCreateWithoutAlertInput[]
    connectOrCreate?: AlertConditionCreateOrConnectWithoutAlertInput | AlertConditionCreateOrConnectWithoutAlertInput[]
    createMany?: AlertConditionCreateManyAlertInputEnvelope
    connect?: AlertConditionWhereUniqueInput | AlertConditionWhereUniqueInput[]
  }

  export type DeliveryChannelUncheckedCreateNestedManyWithoutAlertInput = {
    create?: XOR<DeliveryChannelCreateWithoutAlertInput, DeliveryChannelUncheckedCreateWithoutAlertInput> | DeliveryChannelCreateWithoutAlertInput[] | DeliveryChannelUncheckedCreateWithoutAlertInput[]
    connectOrCreate?: DeliveryChannelCreateOrConnectWithoutAlertInput | DeliveryChannelCreateOrConnectWithoutAlertInput[]
    createMany?: DeliveryChannelCreateManyAlertInputEnvelope
    connect?: DeliveryChannelWhereUniqueInput | DeliveryChannelWhereUniqueInput[]
  }

  export type EnumAlertCategoryFieldUpdateOperationsInput = {
    set?: $Enums.AlertCategory
  }

  export type EnumAlertActionTypeFieldUpdateOperationsInput = {
    set?: $Enums.AlertActionType
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type AlertUpdateselectedChainsInput = {
    set?: string[]
    push?: string | string[]
  }

  export type AlertUpdateselectedMarketsInput = {
    set?: string[]
    push?: string | string[]
  }

  export type AlertUpdatecompareProtocolsInput = {
    set?: $Enums.Protocol[]
    push?: $Enums.Protocol | $Enums.Protocol[]
  }

  export type EnumNotificationFrequencyFieldUpdateOperationsInput = {
    set?: $Enums.NotificationFrequency
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type UserUpdateOneWithoutAlertsNestedInput = {
    create?: XOR<UserCreateWithoutAlertsInput, UserUncheckedCreateWithoutAlertsInput>
    connectOrCreate?: UserCreateOrConnectWithoutAlertsInput
    upsert?: UserUpsertWithoutAlertsInput
    disconnect?: UserWhereInput | boolean
    delete?: UserWhereInput | boolean
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutAlertsInput, UserUpdateWithoutAlertsInput>, UserUncheckedUpdateWithoutAlertsInput>
  }

  export type AlertConditionUpdateManyWithoutAlertNestedInput = {
    create?: XOR<AlertConditionCreateWithoutAlertInput, AlertConditionUncheckedCreateWithoutAlertInput> | AlertConditionCreateWithoutAlertInput[] | AlertConditionUncheckedCreateWithoutAlertInput[]
    connectOrCreate?: AlertConditionCreateOrConnectWithoutAlertInput | AlertConditionCreateOrConnectWithoutAlertInput[]
    upsert?: AlertConditionUpsertWithWhereUniqueWithoutAlertInput | AlertConditionUpsertWithWhereUniqueWithoutAlertInput[]
    createMany?: AlertConditionCreateManyAlertInputEnvelope
    set?: AlertConditionWhereUniqueInput | AlertConditionWhereUniqueInput[]
    disconnect?: AlertConditionWhereUniqueInput | AlertConditionWhereUniqueInput[]
    delete?: AlertConditionWhereUniqueInput | AlertConditionWhereUniqueInput[]
    connect?: AlertConditionWhereUniqueInput | AlertConditionWhereUniqueInput[]
    update?: AlertConditionUpdateWithWhereUniqueWithoutAlertInput | AlertConditionUpdateWithWhereUniqueWithoutAlertInput[]
    updateMany?: AlertConditionUpdateManyWithWhereWithoutAlertInput | AlertConditionUpdateManyWithWhereWithoutAlertInput[]
    deleteMany?: AlertConditionScalarWhereInput | AlertConditionScalarWhereInput[]
  }

  export type DeliveryChannelUpdateManyWithoutAlertNestedInput = {
    create?: XOR<DeliveryChannelCreateWithoutAlertInput, DeliveryChannelUncheckedCreateWithoutAlertInput> | DeliveryChannelCreateWithoutAlertInput[] | DeliveryChannelUncheckedCreateWithoutAlertInput[]
    connectOrCreate?: DeliveryChannelCreateOrConnectWithoutAlertInput | DeliveryChannelCreateOrConnectWithoutAlertInput[]
    upsert?: DeliveryChannelUpsertWithWhereUniqueWithoutAlertInput | DeliveryChannelUpsertWithWhereUniqueWithoutAlertInput[]
    createMany?: DeliveryChannelCreateManyAlertInputEnvelope
    set?: DeliveryChannelWhereUniqueInput | DeliveryChannelWhereUniqueInput[]
    disconnect?: DeliveryChannelWhereUniqueInput | DeliveryChannelWhereUniqueInput[]
    delete?: DeliveryChannelWhereUniqueInput | DeliveryChannelWhereUniqueInput[]
    connect?: DeliveryChannelWhereUniqueInput | DeliveryChannelWhereUniqueInput[]
    update?: DeliveryChannelUpdateWithWhereUniqueWithoutAlertInput | DeliveryChannelUpdateWithWhereUniqueWithoutAlertInput[]
    updateMany?: DeliveryChannelUpdateManyWithWhereWithoutAlertInput | DeliveryChannelUpdateManyWithWhereWithoutAlertInput[]
    deleteMany?: DeliveryChannelScalarWhereInput | DeliveryChannelScalarWhereInput[]
  }

  export type AlertConditionUncheckedUpdateManyWithoutAlertNestedInput = {
    create?: XOR<AlertConditionCreateWithoutAlertInput, AlertConditionUncheckedCreateWithoutAlertInput> | AlertConditionCreateWithoutAlertInput[] | AlertConditionUncheckedCreateWithoutAlertInput[]
    connectOrCreate?: AlertConditionCreateOrConnectWithoutAlertInput | AlertConditionCreateOrConnectWithoutAlertInput[]
    upsert?: AlertConditionUpsertWithWhereUniqueWithoutAlertInput | AlertConditionUpsertWithWhereUniqueWithoutAlertInput[]
    createMany?: AlertConditionCreateManyAlertInputEnvelope
    set?: AlertConditionWhereUniqueInput | AlertConditionWhereUniqueInput[]
    disconnect?: AlertConditionWhereUniqueInput | AlertConditionWhereUniqueInput[]
    delete?: AlertConditionWhereUniqueInput | AlertConditionWhereUniqueInput[]
    connect?: AlertConditionWhereUniqueInput | AlertConditionWhereUniqueInput[]
    update?: AlertConditionUpdateWithWhereUniqueWithoutAlertInput | AlertConditionUpdateWithWhereUniqueWithoutAlertInput[]
    updateMany?: AlertConditionUpdateManyWithWhereWithoutAlertInput | AlertConditionUpdateManyWithWhereWithoutAlertInput[]
    deleteMany?: AlertConditionScalarWhereInput | AlertConditionScalarWhereInput[]
  }

  export type DeliveryChannelUncheckedUpdateManyWithoutAlertNestedInput = {
    create?: XOR<DeliveryChannelCreateWithoutAlertInput, DeliveryChannelUncheckedCreateWithoutAlertInput> | DeliveryChannelCreateWithoutAlertInput[] | DeliveryChannelUncheckedCreateWithoutAlertInput[]
    connectOrCreate?: DeliveryChannelCreateOrConnectWithoutAlertInput | DeliveryChannelCreateOrConnectWithoutAlertInput[]
    upsert?: DeliveryChannelUpsertWithWhereUniqueWithoutAlertInput | DeliveryChannelUpsertWithWhereUniqueWithoutAlertInput[]
    createMany?: DeliveryChannelCreateManyAlertInputEnvelope
    set?: DeliveryChannelWhereUniqueInput | DeliveryChannelWhereUniqueInput[]
    disconnect?: DeliveryChannelWhereUniqueInput | DeliveryChannelWhereUniqueInput[]
    delete?: DeliveryChannelWhereUniqueInput | DeliveryChannelWhereUniqueInput[]
    connect?: DeliveryChannelWhereUniqueInput | DeliveryChannelWhereUniqueInput[]
    update?: DeliveryChannelUpdateWithWhereUniqueWithoutAlertInput | DeliveryChannelUpdateWithWhereUniqueWithoutAlertInput[]
    updateMany?: DeliveryChannelUpdateManyWithWhereWithoutAlertInput | DeliveryChannelUpdateManyWithWhereWithoutAlertInput[]
    deleteMany?: DeliveryChannelScalarWhereInput | DeliveryChannelScalarWhereInput[]
  }

  export type AlertCreateNestedOneWithoutConditionsInput = {
    create?: XOR<AlertCreateWithoutConditionsInput, AlertUncheckedCreateWithoutConditionsInput>
    connectOrCreate?: AlertCreateOrConnectWithoutConditionsInput
    connect?: AlertWhereUniqueInput
  }

  export type EnumConditionTypeFieldUpdateOperationsInput = {
    set?: $Enums.ConditionType
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type EnumSeverityLevelFieldUpdateOperationsInput = {
    set?: $Enums.SeverityLevel
  }

  export type AlertUpdateOneRequiredWithoutConditionsNestedInput = {
    create?: XOR<AlertCreateWithoutConditionsInput, AlertUncheckedCreateWithoutConditionsInput>
    connectOrCreate?: AlertCreateOrConnectWithoutConditionsInput
    upsert?: AlertUpsertWithoutConditionsInput
    connect?: AlertWhereUniqueInput
    update?: XOR<XOR<AlertUpdateToOneWithWhereWithoutConditionsInput, AlertUpdateWithoutConditionsInput>, AlertUncheckedUpdateWithoutConditionsInput>
  }

  export type AlertCreateNestedOneWithoutDeliveryChannelsInput = {
    create?: XOR<AlertCreateWithoutDeliveryChannelsInput, AlertUncheckedCreateWithoutDeliveryChannelsInput>
    connectOrCreate?: AlertCreateOrConnectWithoutDeliveryChannelsInput
    connect?: AlertWhereUniqueInput
  }

  export type EnumDeliveryChannelTypeFieldUpdateOperationsInput = {
    set?: $Enums.DeliveryChannelType
  }

  export type AlertUpdateOneRequiredWithoutDeliveryChannelsNestedInput = {
    create?: XOR<AlertCreateWithoutDeliveryChannelsInput, AlertUncheckedCreateWithoutDeliveryChannelsInput>
    connectOrCreate?: AlertCreateOrConnectWithoutDeliveryChannelsInput
    upsert?: AlertUpsertWithoutDeliveryChannelsInput
    connect?: AlertWhereUniqueInput
    update?: XOR<XOR<AlertUpdateToOneWithWhereWithoutDeliveryChannelsInput, AlertUpdateWithoutDeliveryChannelsInput>, AlertUncheckedUpdateWithoutDeliveryChannelsInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedEnumAlertCategoryFilter<$PrismaModel = never> = {
    equals?: $Enums.AlertCategory | EnumAlertCategoryFieldRefInput<$PrismaModel>
    in?: $Enums.AlertCategory[] | ListEnumAlertCategoryFieldRefInput<$PrismaModel>
    notIn?: $Enums.AlertCategory[] | ListEnumAlertCategoryFieldRefInput<$PrismaModel>
    not?: NestedEnumAlertCategoryFilter<$PrismaModel> | $Enums.AlertCategory
  }

  export type NestedEnumAlertActionTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.AlertActionType | EnumAlertActionTypeFieldRefInput<$PrismaModel>
    in?: $Enums.AlertActionType[] | ListEnumAlertActionTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.AlertActionType[] | ListEnumAlertActionTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumAlertActionTypeFilter<$PrismaModel> | $Enums.AlertActionType
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedEnumNotificationFrequencyFilter<$PrismaModel = never> = {
    equals?: $Enums.NotificationFrequency | EnumNotificationFrequencyFieldRefInput<$PrismaModel>
    in?: $Enums.NotificationFrequency[] | ListEnumNotificationFrequencyFieldRefInput<$PrismaModel>
    notIn?: $Enums.NotificationFrequency[] | ListEnumNotificationFrequencyFieldRefInput<$PrismaModel>
    not?: NestedEnumNotificationFrequencyFilter<$PrismaModel> | $Enums.NotificationFrequency
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedEnumAlertCategoryWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AlertCategory | EnumAlertCategoryFieldRefInput<$PrismaModel>
    in?: $Enums.AlertCategory[] | ListEnumAlertCategoryFieldRefInput<$PrismaModel>
    notIn?: $Enums.AlertCategory[] | ListEnumAlertCategoryFieldRefInput<$PrismaModel>
    not?: NestedEnumAlertCategoryWithAggregatesFilter<$PrismaModel> | $Enums.AlertCategory
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAlertCategoryFilter<$PrismaModel>
    _max?: NestedEnumAlertCategoryFilter<$PrismaModel>
  }

  export type NestedEnumAlertActionTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AlertActionType | EnumAlertActionTypeFieldRefInput<$PrismaModel>
    in?: $Enums.AlertActionType[] | ListEnumAlertActionTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.AlertActionType[] | ListEnumAlertActionTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumAlertActionTypeWithAggregatesFilter<$PrismaModel> | $Enums.AlertActionType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAlertActionTypeFilter<$PrismaModel>
    _max?: NestedEnumAlertActionTypeFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedEnumNotificationFrequencyWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.NotificationFrequency | EnumNotificationFrequencyFieldRefInput<$PrismaModel>
    in?: $Enums.NotificationFrequency[] | ListEnumNotificationFrequencyFieldRefInput<$PrismaModel>
    notIn?: $Enums.NotificationFrequency[] | ListEnumNotificationFrequencyFieldRefInput<$PrismaModel>
    not?: NestedEnumNotificationFrequencyWithAggregatesFilter<$PrismaModel> | $Enums.NotificationFrequency
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumNotificationFrequencyFilter<$PrismaModel>
    _max?: NestedEnumNotificationFrequencyFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedEnumConditionTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.ConditionType | EnumConditionTypeFieldRefInput<$PrismaModel>
    in?: $Enums.ConditionType[] | ListEnumConditionTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ConditionType[] | ListEnumConditionTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumConditionTypeFilter<$PrismaModel> | $Enums.ConditionType
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedEnumSeverityLevelFilter<$PrismaModel = never> = {
    equals?: $Enums.SeverityLevel | EnumSeverityLevelFieldRefInput<$PrismaModel>
    in?: $Enums.SeverityLevel[] | ListEnumSeverityLevelFieldRefInput<$PrismaModel>
    notIn?: $Enums.SeverityLevel[] | ListEnumSeverityLevelFieldRefInput<$PrismaModel>
    not?: NestedEnumSeverityLevelFilter<$PrismaModel> | $Enums.SeverityLevel
  }

  export type NestedEnumConditionTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ConditionType | EnumConditionTypeFieldRefInput<$PrismaModel>
    in?: $Enums.ConditionType[] | ListEnumConditionTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ConditionType[] | ListEnumConditionTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumConditionTypeWithAggregatesFilter<$PrismaModel> | $Enums.ConditionType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumConditionTypeFilter<$PrismaModel>
    _max?: NestedEnumConditionTypeFilter<$PrismaModel>
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type NestedEnumSeverityLevelWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SeverityLevel | EnumSeverityLevelFieldRefInput<$PrismaModel>
    in?: $Enums.SeverityLevel[] | ListEnumSeverityLevelFieldRefInput<$PrismaModel>
    notIn?: $Enums.SeverityLevel[] | ListEnumSeverityLevelFieldRefInput<$PrismaModel>
    not?: NestedEnumSeverityLevelWithAggregatesFilter<$PrismaModel> | $Enums.SeverityLevel
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSeverityLevelFilter<$PrismaModel>
    _max?: NestedEnumSeverityLevelFilter<$PrismaModel>
  }

  export type NestedEnumDeliveryChannelTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.DeliveryChannelType | EnumDeliveryChannelTypeFieldRefInput<$PrismaModel>
    in?: $Enums.DeliveryChannelType[] | ListEnumDeliveryChannelTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.DeliveryChannelType[] | ListEnumDeliveryChannelTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumDeliveryChannelTypeFilter<$PrismaModel> | $Enums.DeliveryChannelType
  }

  export type NestedEnumDeliveryChannelTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.DeliveryChannelType | EnumDeliveryChannelTypeFieldRefInput<$PrismaModel>
    in?: $Enums.DeliveryChannelType[] | ListEnumDeliveryChannelTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.DeliveryChannelType[] | ListEnumDeliveryChannelTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumDeliveryChannelTypeWithAggregatesFilter<$PrismaModel> | $Enums.DeliveryChannelType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumDeliveryChannelTypeFilter<$PrismaModel>
    _max?: NestedEnumDeliveryChannelTypeFilter<$PrismaModel>
  }

  export type AlertCreateWithoutUserInput = {
    id?: string
    category: $Enums.AlertCategory
    actionType: $Enums.AlertActionType
    isComparison?: boolean
    walletAddress?: string | null
    selectedChains?: AlertCreateselectedChainsInput | string[]
    selectedMarkets?: AlertCreateselectedMarketsInput | string[]
    compareProtocols?: AlertCreatecompareProtocolsInput | $Enums.Protocol[]
    notificationFrequency: $Enums.NotificationFrequency
    createdAt?: Date | string
    updatedAt?: Date | string
    conditions?: AlertConditionCreateNestedManyWithoutAlertInput
    deliveryChannels?: DeliveryChannelCreateNestedManyWithoutAlertInput
  }

  export type AlertUncheckedCreateWithoutUserInput = {
    id?: string
    category: $Enums.AlertCategory
    actionType: $Enums.AlertActionType
    isComparison?: boolean
    walletAddress?: string | null
    selectedChains?: AlertCreateselectedChainsInput | string[]
    selectedMarkets?: AlertCreateselectedMarketsInput | string[]
    compareProtocols?: AlertCreatecompareProtocolsInput | $Enums.Protocol[]
    notificationFrequency: $Enums.NotificationFrequency
    createdAt?: Date | string
    updatedAt?: Date | string
    conditions?: AlertConditionUncheckedCreateNestedManyWithoutAlertInput
    deliveryChannels?: DeliveryChannelUncheckedCreateNestedManyWithoutAlertInput
  }

  export type AlertCreateOrConnectWithoutUserInput = {
    where: AlertWhereUniqueInput
    create: XOR<AlertCreateWithoutUserInput, AlertUncheckedCreateWithoutUserInput>
  }

  export type AlertCreateManyUserInputEnvelope = {
    data: AlertCreateManyUserInput | AlertCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type AlertUpsertWithWhereUniqueWithoutUserInput = {
    where: AlertWhereUniqueInput
    update: XOR<AlertUpdateWithoutUserInput, AlertUncheckedUpdateWithoutUserInput>
    create: XOR<AlertCreateWithoutUserInput, AlertUncheckedCreateWithoutUserInput>
  }

  export type AlertUpdateWithWhereUniqueWithoutUserInput = {
    where: AlertWhereUniqueInput
    data: XOR<AlertUpdateWithoutUserInput, AlertUncheckedUpdateWithoutUserInput>
  }

  export type AlertUpdateManyWithWhereWithoutUserInput = {
    where: AlertScalarWhereInput
    data: XOR<AlertUpdateManyMutationInput, AlertUncheckedUpdateManyWithoutUserInput>
  }

  export type AlertScalarWhereInput = {
    AND?: AlertScalarWhereInput | AlertScalarWhereInput[]
    OR?: AlertScalarWhereInput[]
    NOT?: AlertScalarWhereInput | AlertScalarWhereInput[]
    id?: StringFilter<"Alert"> | string
    userId?: StringNullableFilter<"Alert"> | string | null
    category?: EnumAlertCategoryFilter<"Alert"> | $Enums.AlertCategory
    actionType?: EnumAlertActionTypeFilter<"Alert"> | $Enums.AlertActionType
    isComparison?: BoolFilter<"Alert"> | boolean
    walletAddress?: StringNullableFilter<"Alert"> | string | null
    selectedChains?: StringNullableListFilter<"Alert">
    selectedMarkets?: StringNullableListFilter<"Alert">
    compareProtocols?: EnumProtocolNullableListFilter<"Alert">
    notificationFrequency?: EnumNotificationFrequencyFilter<"Alert"> | $Enums.NotificationFrequency
    createdAt?: DateTimeFilter<"Alert"> | Date | string
    updatedAt?: DateTimeFilter<"Alert"> | Date | string
  }

  export type UserCreateWithoutAlertsInput = {
    id?: string
    email?: string | null
  }

  export type UserUncheckedCreateWithoutAlertsInput = {
    id?: string
    email?: string | null
  }

  export type UserCreateOrConnectWithoutAlertsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutAlertsInput, UserUncheckedCreateWithoutAlertsInput>
  }

  export type AlertConditionCreateWithoutAlertInput = {
    id?: string
    conditionType: $Enums.ConditionType
    thresholdValue?: number | null
    thresholdValueLow?: number | null
    thresholdValueHigh?: number | null
    severity: $Enums.SeverityLevel
  }

  export type AlertConditionUncheckedCreateWithoutAlertInput = {
    id?: string
    conditionType: $Enums.ConditionType
    thresholdValue?: number | null
    thresholdValueLow?: number | null
    thresholdValueHigh?: number | null
    severity: $Enums.SeverityLevel
  }

  export type AlertConditionCreateOrConnectWithoutAlertInput = {
    where: AlertConditionWhereUniqueInput
    create: XOR<AlertConditionCreateWithoutAlertInput, AlertConditionUncheckedCreateWithoutAlertInput>
  }

  export type AlertConditionCreateManyAlertInputEnvelope = {
    data: AlertConditionCreateManyAlertInput | AlertConditionCreateManyAlertInput[]
    skipDuplicates?: boolean
  }

  export type DeliveryChannelCreateWithoutAlertInput = {
    id?: string
    channelType: $Enums.DeliveryChannelType
    email?: string | null
    webhookUrl?: string | null
  }

  export type DeliveryChannelUncheckedCreateWithoutAlertInput = {
    id?: string
    channelType: $Enums.DeliveryChannelType
    email?: string | null
    webhookUrl?: string | null
  }

  export type DeliveryChannelCreateOrConnectWithoutAlertInput = {
    where: DeliveryChannelWhereUniqueInput
    create: XOR<DeliveryChannelCreateWithoutAlertInput, DeliveryChannelUncheckedCreateWithoutAlertInput>
  }

  export type DeliveryChannelCreateManyAlertInputEnvelope = {
    data: DeliveryChannelCreateManyAlertInput | DeliveryChannelCreateManyAlertInput[]
    skipDuplicates?: boolean
  }

  export type UserUpsertWithoutAlertsInput = {
    update: XOR<UserUpdateWithoutAlertsInput, UserUncheckedUpdateWithoutAlertsInput>
    create: XOR<UserCreateWithoutAlertsInput, UserUncheckedCreateWithoutAlertsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutAlertsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutAlertsInput, UserUncheckedUpdateWithoutAlertsInput>
  }

  export type UserUpdateWithoutAlertsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UserUncheckedUpdateWithoutAlertsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type AlertConditionUpsertWithWhereUniqueWithoutAlertInput = {
    where: AlertConditionWhereUniqueInput
    update: XOR<AlertConditionUpdateWithoutAlertInput, AlertConditionUncheckedUpdateWithoutAlertInput>
    create: XOR<AlertConditionCreateWithoutAlertInput, AlertConditionUncheckedCreateWithoutAlertInput>
  }

  export type AlertConditionUpdateWithWhereUniqueWithoutAlertInput = {
    where: AlertConditionWhereUniqueInput
    data: XOR<AlertConditionUpdateWithoutAlertInput, AlertConditionUncheckedUpdateWithoutAlertInput>
  }

  export type AlertConditionUpdateManyWithWhereWithoutAlertInput = {
    where: AlertConditionScalarWhereInput
    data: XOR<AlertConditionUpdateManyMutationInput, AlertConditionUncheckedUpdateManyWithoutAlertInput>
  }

  export type AlertConditionScalarWhereInput = {
    AND?: AlertConditionScalarWhereInput | AlertConditionScalarWhereInput[]
    OR?: AlertConditionScalarWhereInput[]
    NOT?: AlertConditionScalarWhereInput | AlertConditionScalarWhereInput[]
    id?: StringFilter<"AlertCondition"> | string
    alertId?: StringFilter<"AlertCondition"> | string
    conditionType?: EnumConditionTypeFilter<"AlertCondition"> | $Enums.ConditionType
    thresholdValue?: FloatNullableFilter<"AlertCondition"> | number | null
    thresholdValueLow?: FloatNullableFilter<"AlertCondition"> | number | null
    thresholdValueHigh?: FloatNullableFilter<"AlertCondition"> | number | null
    severity?: EnumSeverityLevelFilter<"AlertCondition"> | $Enums.SeverityLevel
  }

  export type DeliveryChannelUpsertWithWhereUniqueWithoutAlertInput = {
    where: DeliveryChannelWhereUniqueInput
    update: XOR<DeliveryChannelUpdateWithoutAlertInput, DeliveryChannelUncheckedUpdateWithoutAlertInput>
    create: XOR<DeliveryChannelCreateWithoutAlertInput, DeliveryChannelUncheckedCreateWithoutAlertInput>
  }

  export type DeliveryChannelUpdateWithWhereUniqueWithoutAlertInput = {
    where: DeliveryChannelWhereUniqueInput
    data: XOR<DeliveryChannelUpdateWithoutAlertInput, DeliveryChannelUncheckedUpdateWithoutAlertInput>
  }

  export type DeliveryChannelUpdateManyWithWhereWithoutAlertInput = {
    where: DeliveryChannelScalarWhereInput
    data: XOR<DeliveryChannelUpdateManyMutationInput, DeliveryChannelUncheckedUpdateManyWithoutAlertInput>
  }

  export type DeliveryChannelScalarWhereInput = {
    AND?: DeliveryChannelScalarWhereInput | DeliveryChannelScalarWhereInput[]
    OR?: DeliveryChannelScalarWhereInput[]
    NOT?: DeliveryChannelScalarWhereInput | DeliveryChannelScalarWhereInput[]
    id?: StringFilter<"DeliveryChannel"> | string
    alertId?: StringFilter<"DeliveryChannel"> | string
    channelType?: EnumDeliveryChannelTypeFilter<"DeliveryChannel"> | $Enums.DeliveryChannelType
    email?: StringNullableFilter<"DeliveryChannel"> | string | null
    webhookUrl?: StringNullableFilter<"DeliveryChannel"> | string | null
  }

  export type AlertCreateWithoutConditionsInput = {
    id?: string
    category: $Enums.AlertCategory
    actionType: $Enums.AlertActionType
    isComparison?: boolean
    walletAddress?: string | null
    selectedChains?: AlertCreateselectedChainsInput | string[]
    selectedMarkets?: AlertCreateselectedMarketsInput | string[]
    compareProtocols?: AlertCreatecompareProtocolsInput | $Enums.Protocol[]
    notificationFrequency: $Enums.NotificationFrequency
    createdAt?: Date | string
    updatedAt?: Date | string
    user?: UserCreateNestedOneWithoutAlertsInput
    deliveryChannels?: DeliveryChannelCreateNestedManyWithoutAlertInput
  }

  export type AlertUncheckedCreateWithoutConditionsInput = {
    id?: string
    userId?: string | null
    category: $Enums.AlertCategory
    actionType: $Enums.AlertActionType
    isComparison?: boolean
    walletAddress?: string | null
    selectedChains?: AlertCreateselectedChainsInput | string[]
    selectedMarkets?: AlertCreateselectedMarketsInput | string[]
    compareProtocols?: AlertCreatecompareProtocolsInput | $Enums.Protocol[]
    notificationFrequency: $Enums.NotificationFrequency
    createdAt?: Date | string
    updatedAt?: Date | string
    deliveryChannels?: DeliveryChannelUncheckedCreateNestedManyWithoutAlertInput
  }

  export type AlertCreateOrConnectWithoutConditionsInput = {
    where: AlertWhereUniqueInput
    create: XOR<AlertCreateWithoutConditionsInput, AlertUncheckedCreateWithoutConditionsInput>
  }

  export type AlertUpsertWithoutConditionsInput = {
    update: XOR<AlertUpdateWithoutConditionsInput, AlertUncheckedUpdateWithoutConditionsInput>
    create: XOR<AlertCreateWithoutConditionsInput, AlertUncheckedCreateWithoutConditionsInput>
    where?: AlertWhereInput
  }

  export type AlertUpdateToOneWithWhereWithoutConditionsInput = {
    where?: AlertWhereInput
    data: XOR<AlertUpdateWithoutConditionsInput, AlertUncheckedUpdateWithoutConditionsInput>
  }

  export type AlertUpdateWithoutConditionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    category?: EnumAlertCategoryFieldUpdateOperationsInput | $Enums.AlertCategory
    actionType?: EnumAlertActionTypeFieldUpdateOperationsInput | $Enums.AlertActionType
    isComparison?: BoolFieldUpdateOperationsInput | boolean
    walletAddress?: NullableStringFieldUpdateOperationsInput | string | null
    selectedChains?: AlertUpdateselectedChainsInput | string[]
    selectedMarkets?: AlertUpdateselectedMarketsInput | string[]
    compareProtocols?: AlertUpdatecompareProtocolsInput | $Enums.Protocol[]
    notificationFrequency?: EnumNotificationFrequencyFieldUpdateOperationsInput | $Enums.NotificationFrequency
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneWithoutAlertsNestedInput
    deliveryChannels?: DeliveryChannelUpdateManyWithoutAlertNestedInput
  }

  export type AlertUncheckedUpdateWithoutConditionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    category?: EnumAlertCategoryFieldUpdateOperationsInput | $Enums.AlertCategory
    actionType?: EnumAlertActionTypeFieldUpdateOperationsInput | $Enums.AlertActionType
    isComparison?: BoolFieldUpdateOperationsInput | boolean
    walletAddress?: NullableStringFieldUpdateOperationsInput | string | null
    selectedChains?: AlertUpdateselectedChainsInput | string[]
    selectedMarkets?: AlertUpdateselectedMarketsInput | string[]
    compareProtocols?: AlertUpdatecompareProtocolsInput | $Enums.Protocol[]
    notificationFrequency?: EnumNotificationFrequencyFieldUpdateOperationsInput | $Enums.NotificationFrequency
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deliveryChannels?: DeliveryChannelUncheckedUpdateManyWithoutAlertNestedInput
  }

  export type AlertCreateWithoutDeliveryChannelsInput = {
    id?: string
    category: $Enums.AlertCategory
    actionType: $Enums.AlertActionType
    isComparison?: boolean
    walletAddress?: string | null
    selectedChains?: AlertCreateselectedChainsInput | string[]
    selectedMarkets?: AlertCreateselectedMarketsInput | string[]
    compareProtocols?: AlertCreatecompareProtocolsInput | $Enums.Protocol[]
    notificationFrequency: $Enums.NotificationFrequency
    createdAt?: Date | string
    updatedAt?: Date | string
    user?: UserCreateNestedOneWithoutAlertsInput
    conditions?: AlertConditionCreateNestedManyWithoutAlertInput
  }

  export type AlertUncheckedCreateWithoutDeliveryChannelsInput = {
    id?: string
    userId?: string | null
    category: $Enums.AlertCategory
    actionType: $Enums.AlertActionType
    isComparison?: boolean
    walletAddress?: string | null
    selectedChains?: AlertCreateselectedChainsInput | string[]
    selectedMarkets?: AlertCreateselectedMarketsInput | string[]
    compareProtocols?: AlertCreatecompareProtocolsInput | $Enums.Protocol[]
    notificationFrequency: $Enums.NotificationFrequency
    createdAt?: Date | string
    updatedAt?: Date | string
    conditions?: AlertConditionUncheckedCreateNestedManyWithoutAlertInput
  }

  export type AlertCreateOrConnectWithoutDeliveryChannelsInput = {
    where: AlertWhereUniqueInput
    create: XOR<AlertCreateWithoutDeliveryChannelsInput, AlertUncheckedCreateWithoutDeliveryChannelsInput>
  }

  export type AlertUpsertWithoutDeliveryChannelsInput = {
    update: XOR<AlertUpdateWithoutDeliveryChannelsInput, AlertUncheckedUpdateWithoutDeliveryChannelsInput>
    create: XOR<AlertCreateWithoutDeliveryChannelsInput, AlertUncheckedCreateWithoutDeliveryChannelsInput>
    where?: AlertWhereInput
  }

  export type AlertUpdateToOneWithWhereWithoutDeliveryChannelsInput = {
    where?: AlertWhereInput
    data: XOR<AlertUpdateWithoutDeliveryChannelsInput, AlertUncheckedUpdateWithoutDeliveryChannelsInput>
  }

  export type AlertUpdateWithoutDeliveryChannelsInput = {
    id?: StringFieldUpdateOperationsInput | string
    category?: EnumAlertCategoryFieldUpdateOperationsInput | $Enums.AlertCategory
    actionType?: EnumAlertActionTypeFieldUpdateOperationsInput | $Enums.AlertActionType
    isComparison?: BoolFieldUpdateOperationsInput | boolean
    walletAddress?: NullableStringFieldUpdateOperationsInput | string | null
    selectedChains?: AlertUpdateselectedChainsInput | string[]
    selectedMarkets?: AlertUpdateselectedMarketsInput | string[]
    compareProtocols?: AlertUpdatecompareProtocolsInput | $Enums.Protocol[]
    notificationFrequency?: EnumNotificationFrequencyFieldUpdateOperationsInput | $Enums.NotificationFrequency
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneWithoutAlertsNestedInput
    conditions?: AlertConditionUpdateManyWithoutAlertNestedInput
  }

  export type AlertUncheckedUpdateWithoutDeliveryChannelsInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    category?: EnumAlertCategoryFieldUpdateOperationsInput | $Enums.AlertCategory
    actionType?: EnumAlertActionTypeFieldUpdateOperationsInput | $Enums.AlertActionType
    isComparison?: BoolFieldUpdateOperationsInput | boolean
    walletAddress?: NullableStringFieldUpdateOperationsInput | string | null
    selectedChains?: AlertUpdateselectedChainsInput | string[]
    selectedMarkets?: AlertUpdateselectedMarketsInput | string[]
    compareProtocols?: AlertUpdatecompareProtocolsInput | $Enums.Protocol[]
    notificationFrequency?: EnumNotificationFrequencyFieldUpdateOperationsInput | $Enums.NotificationFrequency
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    conditions?: AlertConditionUncheckedUpdateManyWithoutAlertNestedInput
  }

  export type AlertCreateManyUserInput = {
    id?: string
    category: $Enums.AlertCategory
    actionType: $Enums.AlertActionType
    isComparison?: boolean
    walletAddress?: string | null
    selectedChains?: AlertCreateselectedChainsInput | string[]
    selectedMarkets?: AlertCreateselectedMarketsInput | string[]
    compareProtocols?: AlertCreatecompareProtocolsInput | $Enums.Protocol[]
    notificationFrequency: $Enums.NotificationFrequency
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AlertUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    category?: EnumAlertCategoryFieldUpdateOperationsInput | $Enums.AlertCategory
    actionType?: EnumAlertActionTypeFieldUpdateOperationsInput | $Enums.AlertActionType
    isComparison?: BoolFieldUpdateOperationsInput | boolean
    walletAddress?: NullableStringFieldUpdateOperationsInput | string | null
    selectedChains?: AlertUpdateselectedChainsInput | string[]
    selectedMarkets?: AlertUpdateselectedMarketsInput | string[]
    compareProtocols?: AlertUpdatecompareProtocolsInput | $Enums.Protocol[]
    notificationFrequency?: EnumNotificationFrequencyFieldUpdateOperationsInput | $Enums.NotificationFrequency
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    conditions?: AlertConditionUpdateManyWithoutAlertNestedInput
    deliveryChannels?: DeliveryChannelUpdateManyWithoutAlertNestedInput
  }

  export type AlertUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    category?: EnumAlertCategoryFieldUpdateOperationsInput | $Enums.AlertCategory
    actionType?: EnumAlertActionTypeFieldUpdateOperationsInput | $Enums.AlertActionType
    isComparison?: BoolFieldUpdateOperationsInput | boolean
    walletAddress?: NullableStringFieldUpdateOperationsInput | string | null
    selectedChains?: AlertUpdateselectedChainsInput | string[]
    selectedMarkets?: AlertUpdateselectedMarketsInput | string[]
    compareProtocols?: AlertUpdatecompareProtocolsInput | $Enums.Protocol[]
    notificationFrequency?: EnumNotificationFrequencyFieldUpdateOperationsInput | $Enums.NotificationFrequency
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    conditions?: AlertConditionUncheckedUpdateManyWithoutAlertNestedInput
    deliveryChannels?: DeliveryChannelUncheckedUpdateManyWithoutAlertNestedInput
  }

  export type AlertUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    category?: EnumAlertCategoryFieldUpdateOperationsInput | $Enums.AlertCategory
    actionType?: EnumAlertActionTypeFieldUpdateOperationsInput | $Enums.AlertActionType
    isComparison?: BoolFieldUpdateOperationsInput | boolean
    walletAddress?: NullableStringFieldUpdateOperationsInput | string | null
    selectedChains?: AlertUpdateselectedChainsInput | string[]
    selectedMarkets?: AlertUpdateselectedMarketsInput | string[]
    compareProtocols?: AlertUpdatecompareProtocolsInput | $Enums.Protocol[]
    notificationFrequency?: EnumNotificationFrequencyFieldUpdateOperationsInput | $Enums.NotificationFrequency
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AlertConditionCreateManyAlertInput = {
    id?: string
    conditionType: $Enums.ConditionType
    thresholdValue?: number | null
    thresholdValueLow?: number | null
    thresholdValueHigh?: number | null
    severity: $Enums.SeverityLevel
  }

  export type DeliveryChannelCreateManyAlertInput = {
    id?: string
    channelType: $Enums.DeliveryChannelType
    email?: string | null
    webhookUrl?: string | null
  }

  export type AlertConditionUpdateWithoutAlertInput = {
    id?: StringFieldUpdateOperationsInput | string
    conditionType?: EnumConditionTypeFieldUpdateOperationsInput | $Enums.ConditionType
    thresholdValue?: NullableFloatFieldUpdateOperationsInput | number | null
    thresholdValueLow?: NullableFloatFieldUpdateOperationsInput | number | null
    thresholdValueHigh?: NullableFloatFieldUpdateOperationsInput | number | null
    severity?: EnumSeverityLevelFieldUpdateOperationsInput | $Enums.SeverityLevel
  }

  export type AlertConditionUncheckedUpdateWithoutAlertInput = {
    id?: StringFieldUpdateOperationsInput | string
    conditionType?: EnumConditionTypeFieldUpdateOperationsInput | $Enums.ConditionType
    thresholdValue?: NullableFloatFieldUpdateOperationsInput | number | null
    thresholdValueLow?: NullableFloatFieldUpdateOperationsInput | number | null
    thresholdValueHigh?: NullableFloatFieldUpdateOperationsInput | number | null
    severity?: EnumSeverityLevelFieldUpdateOperationsInput | $Enums.SeverityLevel
  }

  export type AlertConditionUncheckedUpdateManyWithoutAlertInput = {
    id?: StringFieldUpdateOperationsInput | string
    conditionType?: EnumConditionTypeFieldUpdateOperationsInput | $Enums.ConditionType
    thresholdValue?: NullableFloatFieldUpdateOperationsInput | number | null
    thresholdValueLow?: NullableFloatFieldUpdateOperationsInput | number | null
    thresholdValueHigh?: NullableFloatFieldUpdateOperationsInput | number | null
    severity?: EnumSeverityLevelFieldUpdateOperationsInput | $Enums.SeverityLevel
  }

  export type DeliveryChannelUpdateWithoutAlertInput = {
    id?: StringFieldUpdateOperationsInput | string
    channelType?: EnumDeliveryChannelTypeFieldUpdateOperationsInput | $Enums.DeliveryChannelType
    email?: NullableStringFieldUpdateOperationsInput | string | null
    webhookUrl?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type DeliveryChannelUncheckedUpdateWithoutAlertInput = {
    id?: StringFieldUpdateOperationsInput | string
    channelType?: EnumDeliveryChannelTypeFieldUpdateOperationsInput | $Enums.DeliveryChannelType
    email?: NullableStringFieldUpdateOperationsInput | string | null
    webhookUrl?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type DeliveryChannelUncheckedUpdateManyWithoutAlertInput = {
    id?: StringFieldUpdateOperationsInput | string
    channelType?: EnumDeliveryChannelTypeFieldUpdateOperationsInput | $Enums.DeliveryChannelType
    email?: NullableStringFieldUpdateOperationsInput | string | null
    webhookUrl?: NullableStringFieldUpdateOperationsInput | string | null
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}