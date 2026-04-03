package com.attestation.config;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

public class DotenvEnvironmentPostProcessor implements EnvironmentPostProcessor, Ordered {

    private static final String PROPERTY_SOURCE_NAME = "dotenvProperties";
    private static final List<Path> DOTENV_PATHS = List.of(
        Path.of(".env"),
        Path.of("..", ".env")
    );

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        Map<String, Object> properties = new LinkedHashMap<>();

        for (Path path : DOTENV_PATHS) {
            loadDotenvFile(path, properties);
        }

        if (properties.isEmpty()) {
            return;
        }

        environment.getPropertySources().addFirst(new MapPropertySource(PROPERTY_SOURCE_NAME, properties));
    }

    private void loadDotenvFile(Path path, Map<String, Object> properties) {
        if (!Files.exists(path)) {
            return;
        }

        try {
            for (String line : Files.readAllLines(path, StandardCharsets.UTF_8)) {
                parseLine(line, properties);
            }
        } catch (IOException ignored) {
            // Ignore unreadable .env files and continue with the remaining sources.
        }
    }

    private void parseLine(String line, Map<String, Object> properties) {
        String trimmedLine = line.trim();
        if (trimmedLine.isEmpty() || trimmedLine.startsWith("#")) {
            return;
        }

        int separatorIndex = trimmedLine.indexOf('=');
        if (separatorIndex <= 0) {
            return;
        }

        String key = trimmedLine.substring(0, separatorIndex).trim();
        String value = trimmedLine.substring(separatorIndex + 1).trim();

        if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.substring(1, value.length() - 1);
        }

        properties.putIfAbsent(key, value);
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }
}
