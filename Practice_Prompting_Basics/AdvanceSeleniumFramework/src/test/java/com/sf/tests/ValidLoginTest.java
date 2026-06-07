package com.sf.tests;

import com.sf.base.BaseTest;
import com.sf.pages.DashboardPage;
import com.sf.pages.LoginPage;
import com.sf.utils.ConfigReader;
import org.testng.Assert;
import org.testng.annotations.BeforeTest;
import org.testng.annotations.Test;

public class ValidLoginTest extends BaseTest {

    private String validUser;
    private String validPass;

    @BeforeTest(alwaysRun = true)
    public void loadCredentials() throws Exception {
        validUser = ConfigReader.get("app.username");
        validPass = ConfigReader.get("app.password");
        if (validUser.startsWith("REPLACE_WITH") || validPass.startsWith("REPLACE_WITH")) {
            throw new Exception(
                    "Configure real Salesforce credentials in config.properties before running ValidLoginTest");
        }
    }

    @Test(priority = 1, groups = {"smoke", "ui"})
    public void verifyLoginPageIsLoaded() {
        LoginPage loginPage = new LoginPage(driver);
        Assert.assertTrue(loginPage.isLoginPageLoaded(),
                "Login page did not load — login button not visible");
        Assert.assertTrue(loginPage.getPageTitle().toLowerCase().contains("login"),
                "Page title does not contain 'login'. Actual: " + loginPage.getPageTitle());
        Assert.assertTrue(loginPage.isForgotPasswordLinkPresent(),
                "Forgot Password link not displayed on login page");
    }

    @Test(priority = 2, groups = {"smoke", "regression"})
    public void verifySuccessfulLoginNavigatesToDashboard() {
        LoginPage loginPage = new LoginPage(driver);
        Assert.assertTrue(loginPage.isLoginPageLoaded(), "Login page not loaded prior to login attempt");

        loginPage.loginAs(validUser, validPass);

        DashboardPage dashboardPage = new DashboardPage(driver);
        Assert.assertTrue(dashboardPage.isLoaded(),
                "Dashboard did not load after valid login. Current URL: " + dashboardPage.getCurrentUrl());
        Assert.assertFalse(dashboardPage.getCurrentUrl().contains("login.salesforce.com"),
                "Still on login page after successful login. URL: " + dashboardPage.getCurrentUrl());
        Assert.assertTrue(dashboardPage.isAppLauncherPresent(),
                "App Launcher (waffle) not present on dashboard after login");
        Assert.assertTrue(dashboardPage.isNavigationBarPresent(),
                "Navigation bar not present on dashboard after login");
        Assert.assertFalse(loginPage.isErrorDisplayed(),
                "Error message shown for valid credentials: " + loginPage.getErrorMessage());
    }

    @Test(priority = 3, groups = {"smoke", "ui"})
    public void verifyRememberMeCanBeToggled() {
        LoginPage loginPage = new LoginPage(driver);
        Assert.assertTrue(loginPage.isLoginPageLoaded(), "Login page not loaded for remember-me test");

        boolean stateBefore = loginPage.isRememberMeChecked();
        loginPage.toggleRememberMe();
        boolean stateAfter = loginPage.isRememberMeChecked();

        Assert.assertNotEquals(stateAfter, stateBefore,
                "Remember Me checkbox state did not change after toggle");
    }
}
