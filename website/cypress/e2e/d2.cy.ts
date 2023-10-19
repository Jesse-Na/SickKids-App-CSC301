
describe("My First Cypress Test", () => {
  it("Visits the website and asserts content", () => {
    // Visit the website
    cy.visit("https://test-7a901.web.app/device/1FFF7590");
  
    cy.get('[style="flex-grow: 1; display: flex; justify-content: flex-end; padding-right: 10px;"] > div > .MuiButtonBase-root').click();

    cy.get('.MuiPaper-root > .MuiButtonBase-root').click();

    cy.get('#\\:r0\\:').type('yicong.luo@mail.utoronto.ca');

    cy.get('#\\:r1\\:').type('qynbo6-wAfbuz-hucmow');

    cy.get(':nth-child(4) > .MuiButtonBase-root').click();

    cy.get('[style="display: flex; padding-left: 60px;"] > :nth-child(1)').click();

    cy.get('.MuiTableBody-root > :nth-child(1) > :nth-child(1)').click();

    cy.get('.App > :nth-child(2) > :nth-child(2)').click();

    cy.get('#\\:r1n\\:').type("1");

    cy.get('.MuiDialogActions-root > :nth-child(2)').click();
  });
});
