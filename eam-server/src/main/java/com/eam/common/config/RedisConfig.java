package com.eam.common.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;

@Configuration
public class RedisConfig {

    @Value("${spring.data.redis.key-prefix:eam:}")
    private String keyPrefix;

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory factory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(factory);

        // 使用自定义前缀序列化器实现环境隔离
        PrefixedStringRedisSerializer keySerializer = new PrefixedStringRedisSerializer(keyPrefix);

        template.setKeySerializer(keySerializer);
        template.setHashKeySerializer(keySerializer);
        template.setValueSerializer(new StringRedisSerializer());
        template.setHashValueSerializer(new StringRedisSerializer());

        template.afterPropertiesSet();
        return template;
    }

    /**
     * 自定义前缀序列化器，通过继承 StringRedisSerializer 实现全局键名前缀隔离
     */
    private static class PrefixedStringRedisSerializer extends StringRedisSerializer {
        private final String prefix;

        public PrefixedStringRedisSerializer(String prefix) {
            this.prefix = prefix;
        }

        @Override
        @NonNull
        public byte[] serialize(@Nullable String string) {
            if (string == null) {
                return new byte[0]; // 或者返回 super.serialize(null) 如果确定它不为空，但为了满足 @NonNull 约束返回空数组
            }
            if (string.startsWith(prefix)) {
                return super.serialize(string);
            }
            return super.serialize(prefix + string);
        }
    }
}
