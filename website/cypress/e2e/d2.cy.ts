
describe("My First Cypress Test", () => {
  it("Visits the website and test frequency change", () => {

    // Visit the website
    cy.visit("https://test-7a901.web.app/device/1FFF7590");
    
    // click sign out
    cy.get('[style="flex-grow: 1; display: flex; justify-content: flex-end; padding-right: 10px;"] > div > .MuiButtonBase-root').click();
    cy.get('.MuiPaper-root > .MuiButtonBase-root').click();
    
    // sign in with credentials
    cy.get('#\\:r0\\:').type('yicong.luo@mail.utoronto.ca');
    cy.get('#\\:r1\\:').type('qynbo6-wAfbuz-hucmow');

    // click sign in
    cy.get(':nth-child(4) > .MuiButtonBase-root').click();
    
    // click device button
    cy.get('[style="display: flex; padding-left: 60px;"] > :nth-child(1)').click();
    
    // click first device
    cy.get('.MuiTableBody-root > :nth-child(1) > :nth-child(1)').click();

    // if acknowledge button exists, click it
    cy.get('.MuiBox-root > .MuiButtonBase-root').click();
    
    // click edit button
    cy.get('[style="display: flex; justify-content: center; align-items: center; margin-bottom: 10px;"] > .MuiButton-containedPrimary').click();
    
    // change frequency
    cy.get('#\\:r1o\\:').type("1");

    // click save button
    cy.get('.MuiDialogActions-root > :nth-child(2)').click();
  });
});
