package com.acme.financial;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class DbCheck {
    public static void main(String[] args) {
        String url = "jdbc:mysql://gateway01.eu-central-1.prod.aws.tidbcloud.com:4000/acme_financial?useSSL=true&sslMode=VERIFY_IDENTITY&enabledTLSProtocols=TLSv1.2,TLSv1.3";
        String user = "386moUkwsw8zREP.root";
        String pass = "tLzll0DfKoXBGSmU";

        try (Connection conn = DriverManager.getConnection(url, user, pass)) {
            try (Statement stmt = conn.createStatement()) {
                ResultSet rs = stmt.executeQuery("SELECT id, username, email, role, enabled FROM users");
                System.out.println(">>> [DB DUMP] Current Users List:");
                while (rs.next()) {
                    System.out.println(String.format("ID: %d, User: %s, Email: %s, Role: %s, Enabled: %b", 
                        rs.getLong("id"), rs.getString("username"), rs.getString("email"), rs.getString("role"), rs.getBoolean("enabled")));
                }
            }
        } catch (Exception e) {
            System.err.println(">>> [FATAL] DB Check error: " + e.getMessage());
        }
    }
}
