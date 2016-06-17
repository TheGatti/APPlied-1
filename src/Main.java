import jodd.json.JsonParser;
import jodd.json.JsonSerializer;
import org.h2.tools.Server;
import spark.Session;
import spark.Spark;

import java.sql.*;
import java.util.ArrayList;

/**
 * Created by jamesyburr on 6/16/16.
 */
public class Main {

    public static void createTables(Connection conn) throws SQLException {
        Statement stmt = conn.createStatement();
        stmt.execute("CREATE TABLE IF NOT EXISTS users (user_id IDENTITY, username VARCHAR, password VARCHAR)");
        stmt.execute("CREATE TABLE IF NOT EXISTS jobs (job_id IDENTITY, company_name VARCHAR, location VARCHAR, contact_name VARCHAR, contact_number VARCHAR, " +
                "contact_email VARCHAR, have_applied BOOLEAN, rating INT, comments VARCHAR, user_id INT)");
    }

    public static void insertUser(Connection conn, User user) throws SQLException {
        PreparedStatement stmt = conn.prepareStatement("INSERT INTO users VALUES (NULL, ?, ?)");
        stmt.setString(1, user.username);
        stmt.setString(2, user.password);
        stmt.execute();
    }

    static User selectUser(Connection conn, String username) throws SQLException {
        PreparedStatement stmt = conn.prepareStatement("SELECT * FROM users WHERE username = ?");
        stmt.setString(1, username);
        ResultSet results = stmt.executeQuery();
        if (results.next()) {
            int id = results.getInt("user_id");
            String password = results.getString("password");
            return new User(id, username, password);
        }
        return null;
    }

    public static void insertJob(Connection conn, Job job) throws SQLException {
        PreparedStatement stmt = conn.prepareStatement("INSERT INTO jobs VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        stmt.setString(1, job.companyName);
        stmt.setString(2, job.location);
        stmt.setString(3, job.contactName);
        stmt.setString(4, job.contactNumber);
        stmt.setString(5, job.contactEmail);
        stmt.setBoolean(6, job.haveApplied);
        stmt.setInt(7, job.rating);
        stmt.setString(8, job.comments);
        stmt.setInt(9, job.userId);
        stmt.execute();
    }

    public static ArrayList<Job> selectJobs(Connection conn, Integer userId) throws SQLException {
        PreparedStatement stmt = conn.prepareStatement("SELECT * FROM jobs INNER JOIN users ON jobs.user_id = users.user_id WHERE users.user_id = ?");
        stmt.setInt(1, userId);
        ResultSet results = stmt.executeQuery();
        ArrayList<Job> jobs = new ArrayList<>();
        while (results.next()) {
            Integer jobId = results.getInt("jobs.job_id");
            String companyName = results.getString("jobs.company_name");
            String location = results.getString("jobs. location");
            String contactName = results.getString("jobs.contact_name");
            String contactNumber = results.getString("jobs.contact_number");
            String contactEmail = results.getString("jobs.contact_email");
            Boolean haveApplied = results.getBoolean("jobs.have_applied");
            Integer rating = results.getInt("jobs.rating");
            String comments = results.getString("jobs.comments");
            Job job = new Job(jobId, companyName, location, contactName, contactNumber, contactEmail, haveApplied, rating, comments, userId);
            jobs.add(job);
        }
        return jobs;
    }

    public static void main(String[] args) throws SQLException {

        Server.createWebServer().start();
        Connection conn = DriverManager.getConnection("jdbc:h2:./main");
        createTables(conn);

        Spark.externalStaticFileLocation("public");
        Spark.init();

        Spark.get(
            "/",
                (request, response) -> {
                    Session session = request.session();
                    String username = session.attribute("username");

                    User user = selectUser(conn, username);
                    ArrayList<Job> jobs = selectJobs(conn, user.userId);
                    JsonSerializer serializer = new JsonSerializer();
                    return serializer.serialize(jobs);
                }
        );
        Spark.post(
                "/login",
                (request, response) -> {
                    String body = request.body();
                    JsonParser parser = new JsonParser();
                    User user = parser.parse(body, User.class);
                    if (user.username == null || user.password == null) {
                        throw new Exception("Name or password not sent");
                    }
                    User validUser = selectUser(conn, user.username);
                    if (validUser == null) {
                        insertUser(conn, user);
                    }
                    else if (!validUser.password.equals(user.password)) {
                        throw new Exception("Wrong password.");
                    }
                    Session session = request.session();
                    session.attribute("username", validUser);
                    response.redirect("/");
                    return "";
                }
        );
        Spark.post(
                "/logout",
                (request, response) -> {
                    Session session = request.session();
                    session.invalidate();
                    response.redirect("/");
                    return "";
                }
        );
    }
}
