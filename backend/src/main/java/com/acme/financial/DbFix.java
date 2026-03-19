package com.acme.financial;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;

public class DbFix {
    public static void main(String[] args) {
        String url = "jdbc:mysql://gateway01.eu-central-1.prod.aws.tidbcloud.com:4000/acme_financial?useSSL=true&sslMode=VERIFY_IDENTITY&enabledTLSProtocols=TLSv1.2,TLSv1.3";
        String user = "386moUkwsw8zREP.root";
        String pass = "tLzll0DfKoXBGSmU";

        try (Connection conn = DriverManager.getConnection(url, user, pass)) {
            String sql = "UPDATE users SET email = 'dshout01@gmail.com' WHERE username = 'admin' OR email = 'admin@acme.com'";
            try (PreparedStatement startNode = conn.prepareStatement(sql)) {
                int affectedRows = startNode.executeUpdate();
                System.out.println(">>> [DB IDENTITY MIGRATION] Protocol executed. Rows migrated: " + affectedRows);
            }
        } catch (Exception e) {
            System.err.println(">>> [FATAL] Identity migration gateway error: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
