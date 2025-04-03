import path from "path";

const SEQUENCE_SEARCH_PAGE = "http://localhost:3050/search/sequence";

describe("Sequence search page tests", () => {
    it("Press search button dont redirect and do nothing if no value inserted to search", () => {
        cy.visit(SEQUENCE_SEARCH_PAGE);
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        //cy.get('[data-cy="add-test-sequence-search-button"]').click();
        cy.get('[data-cy="search-sequence-button"]').click();
        //wait for sequence to finish
        cy.wait(200000);
        cy.get("body").then(($body) => {
            if ($body.find('[data-cy="found-proteins-table-div"]').length < 1) {
                cy.log(
                    "Table of found proteins not visible (expected) , test pass!",
                );
                return;
            }
        });
    });

    it("Introduce wrong or none existing sequence", () => {
        cy.visit(SEQUENCE_SEARCH_PAGE);
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        //cy.get('[data-cy="add-test-sequence-search-button"]').click();
        
        cy.get('[data-cy="sequence-textarea-input"]')
            .clear()
            .type("nfhnvi27ty57gh2ywu6gt34g5gtrweg653");
        //wait for sequence to finish
        cy.get('[data-cy="search-sequence-button"]').click();
        cy.wait(200000);
        cy.get('[data-cy="error-message-window"]').should(
            "contain",
            "An error occurred while processing the request.",
        );
        cy.get("body").then(($body) => {
            if ($body.find('[data-cy="found-proteins-table-div"]').length < 1) {
                cy.log(
                    "Table of found proteins not visible (expected) , test pass!",
                );
                return;
            }
        });
    });

    it("Search valid sample test sequence", () => {
        cy.visit(SEQUENCE_SEARCH_PAGE);
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="add-test-sequence-search-button"]').click();
        cy.get('[data-cy="search-sequence-button"]').click();
        //wait for sequence to finish
        cy.wait(200000);
        cy.get("body").then(($body) => {
            if ($body.find('[data-cy="found-proteins-table-div"]').length > 0) {
                cy.log(
                    "Table of found proteins is visible (expected) , test pass!",
                );
                return;
            } else {
                throw new Error("No sequence table found test not pass");
            }
        });
    });

    it("Test download csv button", () => {
        cy.visit(SEQUENCE_SEARCH_PAGE);
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="add-test-sequence-search-button"]').click();
        cy.get('[data-cy="search-sequence-button"]').click();
        //wait for sequence to finish
        cy.wait(200000);
        cy.get("body").then(($body) => {
            if ($body.find('[data-cy="found-proteins-table-div"]').length > 0) {
                cy.get('[data-cy="download-button"]')
                    .eq(0)
                    .invoke("removeAttr", "target")
                    .click({ force: true });
                cy.wait(4000);
                const downloadsFolder = Cypress.config("downloadsFolder");
                cy.task(
                    "exists",
                    path.join(downloadsFolder, `sequences.csv`),
                ).then(() => {
                    cy.log("File downloaded successfully ");
                });
                return;
            } else {
                throw new Error("No sequence table found test not pass");
            }
        });
    });
    it("Test download pdf button", () => {
        cy.visit(SEQUENCE_SEARCH_PAGE);
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="add-test-sequence-search-button"]').click();
        cy.get('[data-cy="search-sequence-button"]').click();
        //wait for sequence to finish
        cy.wait(200000);
        cy.get("body").then(($body) => {
            if ($body.find('[data-cy="found-proteins-table-div"]').length > 0) {
                cy.get('[data-cy="download-button"]')
                    .eq(1)
                    .invoke("removeAttr", "target")
                    .click({ force: true });
                cy.wait(4000);
                const downloadsFolder = Cypress.config("downloadsFolder");
                cy.task("exists", path.join(downloadsFolder, `file.pdf`)).then(
                    () => {
                        cy.log("File downloaded successfully ");
                    },
                );
                return;
            } else {
                throw new Error("No sequence table found test not pass");
            }
        });
    });
    it("Test button protein id button is working", () => {
        cy.visit(SEQUENCE_SEARCH_PAGE);
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="add-test-sequence-search-button"]').click();
        cy.get('[data-cy="search-sequence-button"]').click();
        //wait for sequence to finish
        cy.wait(200000);
        cy.get("body").then(($body) => {
            if ($body.find('[data-cy="found-proteins-table-div"]').length > 0) {
                cy.get('[data-cy="protein-id-button"]')
                    .first()
                    .invoke("removeAttr", "target")
                    .click();
                cy.get('[data-cy="protein-id-button"]')
                    .first()
                    .invoke("attr", "custom-value")
                    .then((value) => {
                        cy.url().should(
                            "contain",
                            `http://localhost:3050/proteins/${value}`,
                        );
                    });
            } else {
                throw new Error("No sequence table found test not pass");
            }
        });
    });
});
