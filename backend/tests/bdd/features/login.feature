Feature: User Login
  As a user of the service reservation system
  I want to be able to login using valid credentials
  So that I can access the reservation features

  Background:
    Given the reservation application is running
    And there is a user account with username "user1" and password "password"

  # Positive Scenario
  Scenario: Login succeeds with valid username and password
    Given I am on the login page
    When I enter username "user1"
    And I enter password "password"
    And I click the login button
    Then I should be logged in successfully
    And I receive an authentication token
    And the response contains user data

  # Negative Scenario - wrong password
  Scenario: Login fails with wrong password
    Given I am on the login page
    When I enter username "user1"
    And I enter password "wrongpassword"
    And I click the login button
    Then login should fail with status 401
    And the response contains an error message

  # Negative Scenario - empty fields
  Scenario: Login fails when fields are empty
    Given I am on the login page
    When I enter username ""
    And I enter password ""
    And I click the login button
    Then login should fail with status 400
    And the response contains message "wajib diisi"

  # Boundary Validation - using email
  Scenario: Login succeeds using email as identifier
    Given I am on the login page
    When I enter username "user1@example.com"
    And I enter password "password"
    And I click the login button
    Then I should be logged in successfully

  # Scenario Outline - multiple invalid credentials
  Scenario Outline: Login fails with various invalid credential combinations
    Given I am on the login page
    When I enter username "<username>"
    And I enter password "<password>"
    And I click the login button
    Then login should fail with status <status_code>

    Examples:
      | username  | password    | status_code |
      | notexist  | password123 | 401         |
      | user1     | wrong123    | 401         |
      |           | password    | 400         |
      | user1     |             | 400         |
