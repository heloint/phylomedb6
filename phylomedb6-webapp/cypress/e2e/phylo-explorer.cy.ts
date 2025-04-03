const PHYLO_EXPLORER_URL = "http://localhost:3050/phylo-explorer";

//TODO NOT ALL TESTS WORKING
describe("Phylo-explorer", () => {
    it("Manual button works fine", () => {
        cy.visit(PHYLO_EXPLORER_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();

        cy.get("iframe")
            .its("0.contentDocument.body")
            .should("not.be.empty")
            .then(cy.wrap)
            .find('[data-cy="manual-button"]')
            .should("be.visible")
            .invoke("removeAttr", "target")
            .click();
        cy.wait(2000);
        cy.url().should("contain", "http://localhost:3050/phylo-explorer");
    });

    it("Include button works fine", () => {
        cy.visit(PHYLO_EXPLORER_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();

        cy.get("iframe")
            .its("0.contentDocument.body")
            .should("not.be.empty")
            .then(cy.wrap)
            .within(() => {
                cy.get('[data-cy="search-taxid-input"]').clear().type("a");
                cy.contains("li", "Schizosaccharomyces pombe")
                    .should("exist")
                    .click();
                cy.contains("li", "Yarrowia lipolytica")
                    .should("exist")
                    .click();
                cy.get('[data-cy="include-button"]').click();
            });
    });

    it("Clear button works fine", () => {
        cy.visit(PHYLO_EXPLORER_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();

        cy.get("iframe")
            .its("0.contentDocument.body")
            .should("not.be.empty")
            .then(cy.wrap)
            .within(() => {
                cy.get('[data-cy="search-taxid-input"]').clear().type("a");
                cy.contains("li", "Schizosaccharomyces pombe")
                    .should("exist")
                    .click();
                cy.contains("li", "Yarrowia lipolytica")
                    .should("exist")
                    .click();
                cy.get('[data-cy="clear-button"]').click();
                cy.contains("button", "Clear").should("exist");
            });
    });

    it("Include button works fine and heatmap information button is clicked", () => {
        cy.visit(PHYLO_EXPLORER_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();

        cy.get("iframe")
            .its("0.contentDocument.body")
            .should("not.be.empty")
            .then(cy.wrap)
            .within(() => {
                cy.get('[data-cy="search-taxid-input"]').clear().type("a");
                cy.contains("li", "Schizosaccharomyces pombe")
                    .should("exist")
                    .click();
                cy.contains("li", "Yarrowia lipolytica")
                    .should("exist")
                    .click();
                cy.get('[data-cy="include-button"]').click();

                cy.get("#heatmap-information-button")
                    .should("be.visible")
                    .click({ force: true });
            });
    });

    it("Include button works fine and 2 nodes are clicked", () => {
        cy.visit(PHYLO_EXPLORER_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();

        cy.get("iframe")
            .its("0.contentDocument.body")
            .should("not.be.empty")
            .then(cy.wrap)
            .within(() => {
                cy.get('[data-cy="search-taxid-input"]').clear().type("a");
                cy.contains("li", "Schizosaccharomyces pombe")
                    .should("exist")
                    .click();
                cy.contains("li", "Yarrowia lipolytica")
                    .should("exist")
                    .click();
                cy.get('[data-cy="include-button"]').click();

                cy.get("g")
                    .contains("Schizosaccharomyces pombe")
                    .should("exist")
                    .click({ force: true });

                cy.get("g")
                    .contains("Yarrowia lipolytica")
                    .should("exist")
                    .click({ force: true });

                cy.get("#sendButton")
                    .invoke("removeAttr", "target")
                    .should("be.visible")
                    .click({ force: true });

                cy.wait(6000);

                //TODO PREVENT open in other window an dcheck url should contains
            });
    });

    it("Search input is working and display elements", () => {
        cy.visit(PHYLO_EXPLORER_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();

        cy.get("iframe")
            .its("0.contentDocument.body")
            .should("not.be.empty")
            .then(cy.wrap)
            .within(() => {
                cy.get('[data-cy="search-taxid-input"]').clear().type("a");
                cy.contains("li", "Schizosaccharomyces pombe")
                    .should("exist")
                    .click();
                cy.contains("li", "Yarrowia lipolytica")
                    .should("exist")
                    .click();
                cy.get('[data-cy="include-button"]').click();

                cy.get("#sub-filter-input")
                    .clear({ force: true })
                    .type("a", { force: true });

                cy.contains("li", "Yarrowia lipolytica").should("exist");
            });
    });
    //PENDING END TEST
    it("Arrow button in input display works", () => {
        cy.visit(PHYLO_EXPLORER_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();

        cy.get("iframe")
            .its("0.contentDocument.body")
            .should("not.be.empty")
            .then(cy.wrap)
            .within(() => {
                cy.get('[data-cy="search-taxid-input"]').clear().type("a");
                cy.contains("li", "Schizosaccharomyces pombe")
                    .should("exist")
                    .click();
                cy.contains("li", "Yarrowia lipolytica")
                    .should("exist")
                    .click();
                cy.get('[data-cy="include-button"]').click();

                cy.get("#sub-filter-input")
                    .clear({ force: true })
                    .type("a", { force: true });

                cy.get('button[title="Jump to species.."]')
                    .first()
                    .click({ force: true });
                //TODO CHECK WHAT THIS BUTTON DOES
            });
    });

    it("Plus button in input display works", () => {
        cy.visit(PHYLO_EXPLORER_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();

        cy.get("iframe")
            .its("0.contentDocument.body")
            .should("not.be.empty")
            .then(cy.wrap)
            .within(() => {
                cy.get('[data-cy="search-taxid-input"]').clear().type("a");
                cy.contains("li", "Schizosaccharomyces pombe")
                    .should("exist")
                    .click();
                cy.contains("li", "Yarrowia lipolytica")
                    .should("exist")
                    .click();
                cy.get('[data-cy="include-button"]').click();

                cy.get("#sub-filter-input")
                    .clear({ force: true })
                    .type("a", { force: true });

                cy.get('button[title="Add to filter.."]')
                    .first()
                    .click({ force: true });
                cy.get('li[title^="Schizosaccharomyces pombe"]').should(
                    "exist",
                );
            });
    });

    it("remove button in input elements works", () => {
        cy.visit(PHYLO_EXPLORER_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();

        cy.get("iframe")
            .its("0.contentDocument.body")
            .should("not.be.empty")
            .then(cy.wrap)
            .within(() => {
                cy.get('[data-cy="search-taxid-input"]').clear().type("a");
                cy.contains("li", "Schizosaccharomyces pombe")
                    .should("exist")
                    .click();
                cy.contains("li", "Yarrowia lipolytica")
                    .should("exist")
                    .click();
                cy.get('[data-cy="include-button"]').click();

                cy.get("#sub-filter-input")
                    .clear({ force: true })
                    .type("a", { force: true });

                cy.get('button[title="Add to filter.."]')
                    .first()
                    .click({ force: true });
                cy.get('li[title^="Schizosaccharomyces pombe"]').should(
                    "exist",
                );
                cy.get('[class="removeFilterButton"]').click({ force: true });
                cy.get('li[title^="Schizosaccharomyces pombe"]')
                    .should("not.exist", { timeout: 10000 })
                    .then(() => {
                        cy.log(
                            "Test passed successfully: Element does not exist.",
                        );
                    });
            });
    });

    it("Reset to initial button works", () => {
        cy.visit(PHYLO_EXPLORER_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();

        cy.get("iframe")
            .its("0.contentDocument.body")
            .should("not.be.empty")
            .then(cy.wrap)
            .within(() => {
                cy.get('[data-cy="search-taxid-input"]').clear().type("a");
                cy.contains("li", "Schizosaccharomyces pombe")
                    .should("exist")
                    .click();
                cy.contains("li", "Yarrowia lipolytica")
                    .should("exist")
                    .click();
                cy.get('[data-cy="include-button"]').click();

                cy.get("#sub-filter-input")
                    .clear({ force: true })
                    .type("a", { force: true });

                cy.get('button[title="Add to filter.."]')
                    .first()
                    .click({ force: true });
                cy.get('li[title^="Schizosaccharomyces pombe"]').should(
                    "exist",
                );
                cy.get('[id="reset-initial-button"]').click({ force: true });
                cy.get('li[title^="Schizosaccharomyces pombe"]')
                    .should("not.exist", { timeout: 10000 })
                    .then(() => {
                        cy.log(
                            "Test passed successfully: Element does not exist.",
                        );
                    });
            });
    });

    it("Click get phylomes table without any selection fails", () => {
        cy.visit(PHYLO_EXPLORER_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();

        cy.get("iframe")
            .its("0.contentDocument.body")
            .should("not.be.empty")
            .then(cy.wrap)
            .within(() => {
                cy.get('[data-cy="search-taxid-input"]').clear().type("a");
                cy.contains("li", "Schizosaccharomyces pombe")
                    .should("exist")
                    .click();
                cy.contains("li", "Yarrowia lipolytica")
                    .should("exist")
                    .click();
                cy.get('[data-cy="include-button"]').click();

                cy.get('[id="sendButton"]').click({ force: true });
                cy.contains("p", "* There aren't any species selected.").then(
                    () => {
                        cy.log("test pass message is showen");
                    },
                );
            });
    });

    it("Truncate dendrogram works", () => {
        cy.visit(PHYLO_EXPLORER_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();

        cy.get("iframe")
            .its("0.contentDocument.body")
            .should("not.be.empty")
            .then(cy.wrap)
            .within(() => {
                cy.get('[data-cy="search-taxid-input"]').clear().type("a");
                cy.contains("li", "Schizosaccharomyces pombe")
                    .should("exist")
                    .click();
                cy.contains("li", "Yarrowia lipolytica")
                    .should("exist")
                    .click();
                cy.get('[data-cy="include-button"]').click();

                cy.get('[id="expandButton"]').click({ force: true });
                cy.get('[transform="translate(481, 46)"]').then(() => {
                    cy.log("test pass and button is working ");
                });
            });
    });

    it("Clear all button works", () => {
        cy.visit(PHYLO_EXPLORER_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();

        cy.get("iframe")
            .its("0.contentDocument.body")
            .should("not.be.empty")
            .then(cy.wrap)
            .within(() => {
                cy.get('[data-cy="search-taxid-input"]').clear().type("a");
                cy.contains("li", "Schizosaccharomyces pombe")
                    .should("exist")
                    .click();
                cy.contains("li", "Yarrowia lipolytica")
                    .should("exist")
                    .click();
                cy.get('[data-cy="include-button"]').click();

                cy.get("#sub-filter-input")
                    .clear({ force: true })
                    .type("a", { force: true });

                cy.get('button[title="Add to filter.."]')
                    .first()
                    .click({ force: true });
                cy.get('li[title^="Schizosaccharomyces pombe"]').should(
                    "exist",
                );
                cy.get('[class="green-btn clearFilterButton"]').click({
                    force: true,
                });
                cy.get('li[title^="Schizosaccharomyces pombe"]')
                    .should("not.exist", { timeout: 10000 })
                    .then(() => {
                        cy.log(
                            "Test passed successfully: Element does not exist.",
                        );
                    });
            });
    });

    it("Clear all button works", () => {
        cy.visit(PHYLO_EXPLORER_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();

        cy.get("iframe")
            .its("0.contentDocument.body")
            .should("not.be.empty")
            .then(cy.wrap)
            .within(() => {
                cy.get('[data-cy="search-taxid-input"]').clear().type("a");
                cy.contains("li", "Schizosaccharomyces pombe")
                    .should("exist")
                    .click();
                cy.contains("li", "Yarrowia lipolytica")
                    .should("exist")
                    .click();
                cy.get('[data-cy="include-button"]').click();

                cy.get("#sub-filter-input")
                    .clear({ force: true })
                    .type("a", { force: true });

                cy.get('button[title="Add to filter.."]')
                    .first()
                    .click({ force: true });

                cy.get('[class="green-btn filterButton"]').click({
                    force: true,
                });
                cy.get('[taxid="4896"]').should("exist");
                cy.get('[taxid="4952"]').should("exist");
                cy.get('[taxid="330879"]')
                    .should("not.exist")
                    .then(() => {
                        cy.log("Test passed successfully");
                    });
            });
    });
});
