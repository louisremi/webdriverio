Feature: Test visibility of elements with "overflow(-x/y): hidden"
    As a developer
    I want to be able to test the visibility of an element

    Background:
        Given I open the url "http://localhost:8080/"

    Scenario: overflow: hidden & width/height: 100
        Then  I expect that element "#overflow" is displayed

    Scenario: overflow-x: hidden & width/height: 100
        Then  I expect that element "#overflow-x" is displayed

    Scenario: overflow-y: hidden & width/height: 100
        Then  I expect that element "#overflow-y" is displayed

    Scenario: overflow: hidden & width: 0
        Then  I expect that element "#overflow-0w" is not displayed

    Scenario: overflow: hidden & height: 0
        Then  I expect that element "#overflow-0h" is not displayed

    Scenario: overflow-x: hidden & width: 0
        Then  I expect that element "#overflow-x-0w" is not displayed

    Scenario: overflow-y: hidden & height: 0
        Then  I expect that element "#overflow-y-0h" is not displayed
