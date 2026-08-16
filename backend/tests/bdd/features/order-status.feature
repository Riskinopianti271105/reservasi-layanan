Feature: Order Status Management
  As a user of the service reservation system
  I want to manage the status of my orders
  So that I can monitor the progress of my service reservation

  Background:
    Given the reservation application is running
    And I am logged in as "user1" with password "password"

  # Positive Scenario - valid status change
  Scenario: Change order status from DRAFT to CONFIRMED
    Given there is an order with status "DRAFT"
    When I change the order status to "CONFIRMED"
    Then the order status is successfully changed to "CONFIRMED"
    And the response contains updated order data

  Scenario: Change order status from CONFIRMED to COMPLETED
    Given there is an order with status "CONFIRMED"
    When I change the order status to "COMPLETED"
    Then the order status is successfully changed to "COMPLETED"

  # Negative Scenario - invalid status change
  Scenario: Reject status change from COMPLETED to CANCELLED
    Given there is an order with status "COMPLETED"
    When I change the order status to "CANCELLED"
    Then the status change should be rejected with status 400
    And the response contains message "COMPLETED"

  # Negative Scenario - CANCELLED cannot be reactivated
  Scenario: Reject reactivation of CANCELLED order
    Given there is an order with status "CANCELLED"
    When I change the order status to "CONFIRMED"
    Then the status change should be rejected with status 400
    And the response contains message "CANCELLED"

  # Scenario Outline - various invalid transitions
  Scenario Outline: Reject unauthorized status transitions
    Given there is an order with status "<current_status>"
    When I change the order status to "<new_status>"
    Then the status change should be rejected with status 400

    Examples:
      | current_status | new_status |
      | COMPLETED      | CANCELLED  |
      | COMPLETED      | DRAFT      |
      | COMPLETED      | CONFIRMED  |
      | CANCELLED      | DRAFT      |
      | CANCELLED      | CONFIRMED  |
      | DRAFT          | COMPLETED  |
