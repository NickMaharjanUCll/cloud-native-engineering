import { createClient } from 'redis';

interface RedisProxyInterface {
    set: (key: string, value: string, options?: {}) => Promise<string | null>;
    get: (key: string) => Promise<string | null>;
    quit: () => Promise<string>;
    isOpen: boolean;
    isReady: boolean;
    connect: () => Promise<unknown>;
}

export class LinkCache {
    private static instance: LinkCache;
    private readonly cacheClient: RedisProxyInterface;

    private constructor(redisClient: RedisProxyInterface) {
        if (!redisClient) {
            throw new Error('A Redis client is required.');
        }
        this.cacheClient = redisClient;
    }

    private static async createClient() {
        const cacheHostName = process.env.REDIS_HOST_NAME;
        const cachePassword = process.env.REDIS_ACCESS_KEY;
        const cachePort = process.env.REDIS_PORT || '6380';

        if (!cacheHostName) throw Error('REDIS_HOST_NAME is empty');
        if (!cachePassword) throw Error('REDIS_ACCESS_KEY is empty');
        
        // Connect manually: redis-cli -u rediss://password@host:tlsport
        // Connect manually: redis-cli -u redis://password@host:port
        const url = `rediss://${cacheHostName}:${cachePort}`;
        console.log(`Connecting to Redis at ${url}`);

        const rawClient = createClient({
            url: url,
            password: cachePassword,
            socket: {
                connectTimeout: 30000,
                reconnectStrategy: (retries) => {
                    if (retries > 10) {
                        return new Error('Redis connection retry limit reached');
                    }
                    return Math.min(retries * 100, 3000);
                },
            },
        });

        // Add event listeners for troubleshooting
        rawClient.on('error', (err) => console.error('Redis Client Error:', err));
        rawClient.on('connect', () => console.log('Redis Client Connected'));
        rawClient.on('ready', () => console.log('Redis Client Ready'));

        const cacheConnection: RedisProxyInterface = {
            set: async (key, value, options) => {
                try {
                    console.log(`🔍 Setting Redis key: ${key}`);
                    const result = await rawClient.set(key, value, options);
                    console.log(`✅ Successfully set Redis key: ${key}`);
                    return result ? result.toString() : null;
                } catch (error) {
                    console.error(`❌ Redis SET error for key ${key}:`, error);
                    return null;
                }
            },
            get: async (key) => {
                try {
                    console.log(`🔍 Getting Redis key: ${key}`);
                    const result = await rawClient.get(key);
                    if (result) {
                        console.log(`🎯 Cache HIT for key: ${key}`);
                    } else {
                        console.log(`⚠️ Cache MISS for key: ${key}`);
                    }
                    return result ? result.toString() : null;
                } catch (error) {
                    console.error(`❌ Redis GET error for key ${key}:`, error);
                    return null;
                }
            },
            quit: async () => {
                try {
                    await rawClient.quit();
                    console.log('👋 Redis connection closed');
                    return 'OK';
                } catch (error) {
                    console.error('❌ Redis QUIT error:', error);
                    return 'Error';
                }
            },
            isOpen: rawClient.isOpen,
            isReady: rawClient.isReady,
            connect: async () => {
                try {
                    if (rawClient.isOpen) {
                        console.log('✅ Redis client already connected, skipping connection');
                        return rawClient;
                    }
                    console.log('🔄 Connecting to Redis...');
                    return await rawClient.connect();
                } catch (error) {
                    // Check if the error is just "Socket already opened"
                    if (error.message && error.message.includes('Socket already opened')) {
                        console.log('✅ Socket was already open, continuing safely');
                        return rawClient;
                    }
                    console.error('❌ Redis CONNECT error:', error);
                    throw error;
                }
            },
        };

        try {
            await cacheConnection.connect();
            return cacheConnection;
        } catch (error) {
            console.error('❌ Failed to establish initial Redis connection:', error);
            throw error;
        }
    }

    static async getInstance() {
        if (!this.instance) {
            try {
                const cacheConnection = await this.createClient();
                this.instance = new LinkCache(cacheConnection);
                console.log('✅ LinkCache instance created successfully');
            } catch (error) {
                console.error('❌ Failed to create LinkCache instance:', error);
                throw error;
            }
        } else {
            // Check if we need to reconnect
            if (!this.instance.cacheClient.isOpen || !this.instance.cacheClient.isReady) {
                try {
                    console.log('🔄 Reconnecting to Redis...');
                    // Only connect if not connected - this should be safer now
                    if (!this.instance.cacheClient.isOpen) {
                        await this.instance.cacheClient.connect();
                    }
                    console.log('✅ Redis reconnection successful');
                } catch (error) {
                    console.error('❌ Failed to reconnect to Redis:', error);
                    try {
                        console.log(
                            '🔄 Creating new LinkCache instance after reconnection failure...'
                        );
                        this.instance = new LinkCache(await this.createClient());
                        console.log('✅ New LinkCache instance created successfully');
                    } catch (innerError) {
                        console.error(
                            '❌ Failed to create new LinkCache instance after reconnection failure:',
                            innerError
                        );
                        throw innerError;
                    }
                }
            }
        }
        return this.instance;
    }

    async quit() {
        await this.cacheClient.quit();
    }

    async setLinkMapping(key: string, value: string, expireSeconds = 600) {
        console.log(`💾 Caching data with key: ${key}`);
        return await this.cacheClient.set(key, value, { EX: expireSeconds });
    }

    async getLinkMapping(key: string) {
        return await this.cacheClient.get(key);
    }
}
