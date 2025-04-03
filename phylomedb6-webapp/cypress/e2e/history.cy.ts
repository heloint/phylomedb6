const HISTORY_URL = "http://localhost:3050/search/history";

describe("History page tests", () => {
    const TEST_TOKEN = Cypress.env("TEST_USER_TOKEN");
    const LOGIN_URL = "http://localhost:3050/login";
    it("Check button of gene is working", () => {
        cy.visit(`${LOGIN_URL}?login_token=${TEST_TOKEN}`);
        cy.wait(3000);
        cy.visit("http://localhost:3050/search/gene?gene=fam169b");
        cy.wait(5000);
        cy.visit(HISTORY_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('div[role="row"]')
            .filter((index, row) => {
                return Cypress.$(row).text().includes("gene");
            })
            .find("a")
            .first()
            .invoke("removeAttr", "target")
            .click();
        cy.url().should("contain", "http://localhost:3050/search/gene");
    });

    it("Check button of sequence is working", () => {
        cy.visit(`${LOGIN_URL}?login_token=${TEST_TOKEN}`);
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.wait(3000);
        cy.visit("http://localhost:3050/search/sequence");
        cy.get('[data-cy="add-test-sequence-search-button"]').click();
        cy.get('[data-cy="search-sequence-button"]').click();
        //wait for sequence to finish
        cy.wait(200000);
        cy.visit(HISTORY_URL);
        cy.get('div[role="row"]')
            .filter((index, row) => {
                return Cypress.$(row).text().includes("sequence");
            })
            .find("button")
            .first()
            .click();
        cy.url().should("contain", "http://localhost:3050/search/sequence");
    });

    it("Delete button is working", () => {
        cy.visit(`${LOGIN_URL}?login_token=${TEST_TOKEN}`);
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.wait(3000);
        cy.visit("http://localhost:3050/search/gene?gene=fam169b");
        cy.wait(5000);
        cy.visit(HISTORY_URL);
        cy.get('div[role="row"]')
            .find('input[type="checkbox"]')
            .check({ force: true });
        cy.get('[data-cy="select-action-history"]').select("del");
        cy.get('[data-cy="confirm-action-button"]').click();
        cy.get('[data-cy="table-div-history"]')
            .contains("No Rows To Show")
            .should("be.visible");
    });
});
