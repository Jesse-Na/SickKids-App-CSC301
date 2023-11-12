describe("My First Cypress Test", () => {
  it("Visits the website and test patient table", () => {

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
    
    // click patients button
    cy.get('[style="display: flex; padding-left: 60px;"] > :nth-child(3)').click();

    // search for patient
    cy.get('#input-with-icon-textfield').type("pt-1");

    // click patient
    cy.get('.MuiTableBody-root > .MuiTableRow-root > :nth-child(1)').click();
  });
});