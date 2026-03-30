FROM maven:3.8.5-openjdk-17-slim AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/financial-*-boot.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-XX:+UseParallelGC", "-Xmx384m", "-Xms256m", "-XX:MaxMetaspaceSize=128m", "-Djava.security.egd=file:/dev/./urandom", "-Dserver.port=${PORT:8081}", "-jar", "app.jar"]
