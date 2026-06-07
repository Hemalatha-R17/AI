package com.sf.pages;

import com.sf.utils.ConfigReader;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class DashboardPage {

    private final WebDriver driver;
    private final WebDriverWait wait;

    @FindBy(xpath = "//button[@title='App Launcher']")
    private WebElement appLauncherButton;

    @FindBy(xpath = "//nav[contains(@class,'slds-context-bar')]")
    private WebElement navigationBar;

    @FindBy(xpath = "//span[contains(@class,'profileName') or contains(@class,'userProfile-Name')]")
    private WebElement userProfileName;

    @FindBy(xpath = "//input[contains(@placeholder,'Search') or @title='Search']")
    private WebElement globalSearchBox;

    @FindBy(xpath = "//div[contains(@class,'slds-global-header')]")
    private WebElement globalHeader;

    @FindBy(xpath = "//div[contains(@class,'slds-icon-waffle')]")
    private WebElement waffleIcon;

    public DashboardPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(ConfigReader.getInt("timeout.explicit")));
        PageFactory.initElements(driver, this);
    }

    public boolean isLoaded() {
        try {
            wait.until(ExpectedConditions.not(
                    ExpectedConditions.urlContains("login.salesforce.com")));
            return wait.until(ExpectedConditions.visibilityOf(globalHeader)).isDisplayed();
        } catch (TimeoutException e) {
            return false;
        }
    }

    public boolean isAppLauncherPresent() {
        try {
            return wait.until(ExpectedConditions.visibilityOf(appLauncherButton)).isDisplayed();
        } catch (TimeoutException | NoSuchElementException e) {
            try {
                return wait.until(ExpectedConditions.visibilityOf(waffleIcon)).isDisplayed();
            } catch (TimeoutException | NoSuchElementException ex) {
                return false;
            }
        }
    }

    public boolean isNavigationBarPresent() {
        try {
            return wait.until(ExpectedConditions.visibilityOf(navigationBar)).isDisplayed();
        } catch (TimeoutException | NoSuchElementException e) {
            return false;
        }
    }

    public boolean isGlobalSearchPresent() {
        try {
            return wait.until(ExpectedConditions.visibilityOf(globalSearchBox)).isDisplayed();
        } catch (TimeoutException | NoSuchElementException e) {
            return false;
        }
    }

    public String getLoggedInUserName() {
        try {
            return wait.until(ExpectedConditions.visibilityOf(userProfileName)).getText().trim();
        } catch (TimeoutException | NoSuchElementException e) {
            return "";
        }
    }

    public String getCurrentUrl() {
        return driver.getCurrentUrl();
    }

    public String getPageTitle() {
        return driver.getTitle();
    }
}
