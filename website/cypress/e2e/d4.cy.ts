describe("My First Cypress Test", () => {
  it("Visits the website and test frequency change", () => {
    // Visit the website
    cy.visit("https://test-7a901.web.app/device/1FFF7590");

    // click sign out
    cy.get(
      '[style="flex-grow: 1; display: flex; justify-content: flex-end; padding-right: 10px;"] > div > .MuiButtonBase-root'
    ).click();
    cy.get(".MuiPaper-root > .MuiButtonBase-root").click();

    // sign in with credentials
    cy.get("#\\:r0\\:").type("yicong.luo@mail.utoronto.ca");
    cy.get("#\\:r1\\:").type("qynbo6-wAfbuz-hucmow");

    // click sign in
    cy.get(":nth-child(4) > .MuiButtonBase-root").click();

    // click device button
    cy.get(
      '[style="display: flex; padding-left: 60px;"] > :nth-child(1)'
    ).click();

    // click first device
    cy.get(".MuiTableBody-root > :nth-child(1) > :nth-child(1)").click();

    // if acknowledge button exists, click it
    cy.get("body").then(($body) => {
      // Check if the element exists in the DOM
      if (
        $body.find(".MuiDialogActions-root > .MuiButtonBase-root").length > 0
      ) {
        // Element exists, perform some actions
        cy.get(".MuiDialogActions-root > .MuiButtonBase-root").click();
      } else {
        // Element does not exist, perform alternate actions
        cy.log("warning already clicked");
      }
    });
    
  });
});
