/** @type {import('next').NextConfig} */
const nextConfig = {
    logging: {
        fetches: {
            fullUrl: true,
        },
    },
    experimental: {
        serverActions: {
            allowedOrigins: ["beta.phylomedb.org", "*beta.phylomedb.org"],
        },
    },
    webpack: (config, _) => {
        config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
        };
        config.module.rules.push({
            test: /\.node$/,
            loader: "node-loader",
        });
        return {
            ...config,
            watchOptions: {
                ...config.watchOptions,
                poll: 800,
                aggregateTimeout: 300,
            },
        };
    },
};

export default nextConfig;
