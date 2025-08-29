package com.moviebooking.config;

import com.fasterxml.jackson.databind.Module;
import com.fasterxml.jackson.datatype.hibernate5.jakarta.Hibernate5JakartaModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JacksonConfig {

    @Bean
    public Module hibernate5Module() {
        // Configure Jackson to handle Hibernate proxies lazily without initializing them
        Hibernate5JakartaModule module = new Hibernate5JakartaModule();
        module.disable(Hibernate5JakartaModule.Feature.USE_TRANSIENT_ANNOTATION);
        module.enable(Hibernate5JakartaModule.Feature.SERIALIZE_IDENTIFIER_FOR_LAZY_NOT_LOADED_OBJECTS);
        return module;
    }
}
