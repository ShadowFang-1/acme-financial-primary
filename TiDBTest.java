import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class TiDBTest {
    public static void main(String[] args) {
        String url = "jdbc:mysql://gateway01.eu-central-1.prod.aws.tidbcloud.com:4000/acme_financial?useSSL=true&sslMode=VERIFY_IDENTITY&enabledTLSProtocols=TLSv1.2,TLSv1.3";
        String user = "386moUkwsw8zREP.root";
        String password = "tLzll0DfKoXBGSmU";

        try (Connection conn = DriverManager.getConnection(url, user, password)) {
            System.out.println("Connection successful!");
            try (Statement stmt = conn.createStatement()) {
                ResultSet rs = stmt.executeQuery("SELECT VERSION()");
                if (rs.next()) {
                    System.out.println("TiDB Version: " + rs.getString(1));
                }
            }
        } catch (Exception e) {
            System.out.println("Connection failed!");
            e.printStackTrace();
        }
    }
}
