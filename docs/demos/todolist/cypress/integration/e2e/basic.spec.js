// from ./cypress-test-cases/cypress/tests_for_hs/test1.js
/// <reference types="cypress" />
// $(npm bin)/cypress run  --spec ./cypress-test-cases/cypress/integration/tests_for_hs/test1.js

context('Hookstate test suite', () => {
  beforeEach(() => {
      cy.visit('http://localhost:3000/');
  })

  it('Todolist should allow to mark tasks done / undone', () => {   

      cy.get('#taskCheckbox1').not('[disabled]') 
        .check().should('be.checked')

      cy.get('#taskCheckbox2').not('[disabled]') 
        .check().should('be.checked')
      
      cy.get('#taskCheckbox3').not('[disabled]') 
        .check().should('be.checked')
      cy.get('#taskCheckbox100',{timeout:10000}).not('[disabled]') 
        .check().should('be.checked')

      // .uncheck() accepts a value argument
      cy.get('#taskCheckbox1')
        .not('[disabled]')
        .uncheck().should('not.be.checked')
      cy.get('#taskCheckbox2')
        .check()
        .uncheck().should('not.be.checked')
      cy.get('#taskCheckbox3')
        .check()
        .uncheck().should('not.be.checked')
      cy.get('#taskCheckbox100')
        .uncheck({ force: true }).should('not.be.checked')

      // .chlick()
      cy.get('#taskCheckbox1').click()
      .check().should('be.checked')
      cy.get('#taskCheckbox2').click()
      .check().should('be.checked')
      cy.get('#taskCheckbox3').click()
      .check().should('be.checked')
      cy.get('#taskCheckbox100').click()
      .check().should('be.checked')
      
  });
  
  it('Todolist should delete tasks', () => {
    cy.get('#taskCheckbox100',{timeout:11000}).not('[disabled]') 
    cy.get('#task1 > div > button').click();
    cy.get('#task2 > div > button').click();
    cy.get('#task3 > div > button').click();
    cy.get('#task100 > div > button').click();

    cy.get('#buttonAddTask > button').click()
    cy.get('#buttonAddTask > button').click()
    cy.get('#buttonAddTask > button').click()
    cy.get('#buttonAddTask > button').click()

    cy.get('#taskCheckbox1').not('[disabled]') 
      .check().should('be.checked')

    cy.get('#taskCheckbox2').not('[disabled]') 
      .check().should('be.checked')
  
    cy.get('#taskCheckbox3').not('[disabled]') 
      .check().should('be.checked')

    cy.get('#taskCheckbox4').not('[disabled]') 
      .check().should('be.checked')
  });

})