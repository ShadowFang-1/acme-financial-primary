import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class DbDiagnostic {
    public static void main(String[] args) {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            String url = "jdbc:mysql://gateway01.eu-central-1.prod.aws.tidbcloud.com:4000/acme_financial?useSSL=true&sslMode=VERIFY_IDENTITY&enabledTLSProtocols=TLSv1.2,TLSv1.3";
            Connection conn = DriverManager.getConnection(url, "386moUkwsw8zREP.root", "tLzll0DfKoXBGSmU");
            Statement stmt = conn.createStatement();
            
            System.out.println("Checking transactions...");
            ResultSet rs = stmt.executeQuery("SELECT * FROM transactions");
            int count = 0;
            while(rs.next()) {
                count++;
                System.out.println("TX: ID=" + rs.getLong("id") + " Sender=" + rs.getString("sender_account_id") + " Receiver=" + rs.getString("receiver_account_id") + " Amount=" + rs.getBigDecimal("amount"));
            }
            System.out.println("Total transactions found: " + count);
            
            conn.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
