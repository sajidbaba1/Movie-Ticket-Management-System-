# Backend Dockerfile - Spring Boot (Maven multi-stage)
# Build stage
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /workspace

# Cache dependencies
COPY pom.xml ./
RUN mvn -q -e -B -DskipTests dependency:go-offline || true

# Copy sources and build
COPY src ./src
RUN mvn -q -e -B -DskipTests package

# Runtime stage
FROM eclipse-temurin:17-jre
WORKDIR /app

# Copy built jar
COPY --from=build /workspace/target/*.jar /app/app.jar

# Configure JVM options via env (optional)
ENV JAVA_OPTS="-Xms256m -Xmx512m"

# Expose API port
EXPOSE 8080

# Healthcheck (optional)
# HEALTHCHECK --interval=30s --timeout=3s --start-period=30s CMD wget -qO- http://localhost:8080/actuator/health || exit 1

# Run
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
