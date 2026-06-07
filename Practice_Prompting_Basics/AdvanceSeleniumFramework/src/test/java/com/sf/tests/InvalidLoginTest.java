package com.sf.tests;

import com.sf.base.BaseTest;
import com.sf.pages.LoginPage;
import org.testng.Assert;
import org.testng.annotations.BeforeTest;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

public class InvalidLoginTest extends BaseTest {

    @BeforeTest(alwaysRun = true)
    public void suiteInit() {
        System.out.println("Starting InvalidLoginTest suite against Salesforce login page");
    }

    @DataProvider(name = "invalidCredentials")
    public Object[][] invalidCredentialsProvider() {
        return new Object[][]{
                {"", "",                              "empty username and password"},
                {"", "SomePass@123",                 "empty username with valid-format password"},
                {"invaliduser@example.com", "",       "valid-format username with empty password"},
                {"invaliduser@example.com", "WrongPass!23", "wrong username and wrong password"},
                {"not-an-email", "AnyPass@1",        "malformed username (not an email format)"}
        };
    }

    @Test(dataProvider = "invalidCredentials", priority = 1, groups = {"negative", "regression"})
    public void verifyLoginFailsForInvalidCredentials(String username, String password, String scenario) {
        LoginPage loginPage = new LoginPage(driver);
        Assert.assertTrue(loginPage.isLoginPageLoaded(),
                "Login page not loaded before attempting scenario: " + scenario);

        loginPage.loginAs(username, password);

        boolean errorVisible = loginPage.isErrorDisplayed();
        boolean stillOnLoginPage = loginPage.getCurrentUrl().contains("login.salesforce.com");

        Assert.assertTrue(errorVisible || stillOnLoginPage,
                "Expected failure indicator (error message or stayed on login page) for scenario: ["
                        + scenario + "] | URL=" + loginPage.getCurrentUrl());

        if (errorVisible) {
            String errorText = loginPage.getErrorMessage();
            Assert.assertFalse(errorText.isEmpty(),
                    "Error element is visible but text is empty for scenario: " + scenario);
        }
    }

    @Test(priority = 2, groups = {"negative", "ui"})
    public void verifyNoErrorShownOnFreshPageLoad() {
        LoginPage loginPage = new LoginPage(driver);
        Assert.assertTrue(loginPage.isLoginPageLoaded(),
                "Login page failed to load for fresh-load check");
        Assert.assertFalse(loginPage.isErrorDisplayed(),
                "Error message unexpectedly displayed on a fresh login page load");
    }

    @Test(priority = 3, groups = {"negative", "ui"})
    public void verifyLoginPageRemainsAfterFailedAttempt() {
        LoginPage loginPage = new LoginPage(driver);
        Assert.assertTrue(loginPage.isLoginPageLoaded(), "Login page not loaded before test");

        loginPage.loginAs("fake@notreal.com", "BadPassword99!");

        Assert.assertTrue(loginPage.getCurrentUrl().contains("login.salesforce.com"),
                "Expected to remain on login page after failed attempt. URL: " + loginPage.getCurrentUrl());
    }
}
