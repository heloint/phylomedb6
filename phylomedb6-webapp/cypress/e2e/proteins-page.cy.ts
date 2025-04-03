import path from "path";
const PROTEIN = "1142648";
const PHYLOMES_URL = `http://localhost:3050/proteins/${PROTEIN}`;

describe("Proteins page", () => {
    it("should redirect to description page when a PhyId button is clicked", () => {
        cy.visit(PHYLOMES_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="phyid-button"]')
            .first()
            .invoke("attr", "custom-value")
            .then((value) => {
                cy.get('[data-cy="phyid-button"]').first().click();
                cy.url().should(
                    "include",
                    `http://localhost:3050/phylomes/${value}/description`,
                );
            });
    });

    it("should redirect to ncbi page when a seed-species button is clicked", () => {
        cy.visit(PHYLOMES_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();

        cy.get('[data-cy="seed-species-button"]')
            .first()
            .invoke("attr", "custom-value")
            .then((value) => {
                cy.get('[data-cy="seed-species-button"]')
                    .first()
                    .invoke("removeAttr", "target")
                    .click();

                // Pasamos value usando args
                cy.origin(
                    "https://www.ncbi.nlm.nih.gov",
                    { args: { value } },
                    ({ value }) => {
                        cy.url().should(
                            "include",
                            `/Taxonomy/Browser/wwwtax.cgi?id=${value}`,
                        );
                    },
                );
            });
    });

    //TODO  CHECK CORRECT LINK CASE
    it("Verify the pubmed button redirects to pubmed", () => {
        cy.visit(PHYLOMES_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="pubmed-button"]')
            .first()
            .invoke("attr", "custom-value")
            .then((value) => {
                if (value === "null") {
                    cy.log("Button not exists skiped test");
                    return;
                }
                Cypress.env("speciesId", value);
                cy.get('[data-cy="pubmed-button"]')
                    .first()
                    .click({ force: true });
                cy.origin("https://www.ncbi.nlm.nih.gov", () => {
                    const speciesId = Cypress.env("speciesId");
                    cy.url().should(
                        "include",
                        `https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=${speciesId}`,
                    );
                });
            });
    });

    it("Verify the downloaded tree file", () => {
        cy.visit(PHYLOMES_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="download-trees-button"]')
            .first()
            .invoke("attr", "custom-value")
            .then((value) => {
                cy.get('[data-cy="download-trees-button"]')
                    .first()
                    .click({ force: true });
                const downloadsFolder = Cypress.config("downloadsFolder");
                cy.task(
                    "exists",
                    path.join(
                        downloadsFolder,
                        `Phylome_000${value}_trees.tar.gz`,
                    ),
                ).then(() => {
                    cy.log("File downloaded successfully ");
                });
            });
    });

    it("Verify the downloaded alignments file", () => {
        cy.visit(PHYLOMES_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="download-alignments-button"]')
            .first()
            .invoke("attr", "custom-value")
            .then((value) => {
                cy.get('[data-cy="download-alignments-button"]')
                    .first()
                    .click({ force: true });
                const downloadsFolder = Cypress.config("downloadsFolder");
                cy.task(
                    "exists",
                    path.join(
                        downloadsFolder,
                        `Phylome_000${value}_alignments.tar.gz`,
                    ),
                ).then(() => {
                    cy.log("File downloaded successfully ");
                });
            });
    });

    it("Verify the downloaded orthologs file", () => {
        cy.visit(PHYLOMES_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="download-orthologs-button"]')
            .first()
            .invoke("attr", "custom-value")
            .then((value) => {
                cy.get('[data-cy="download-orthologs-button"]')
                    .first()
                    .invoke("removeAttr", "target")
                    .click({ force: true });
                cy.wait(5000);
                const downloadsFolder = Cypress.config("downloadsFolder");
                cy.task(
                    "exists",
                    path.join(
                        downloadsFolder,
                        `phylome_${value}_orthologs.txt.gz`,
                    ),
                ).then(() => {
                    cy.log("File downloaded successfully ");
                });
            });
    });

    it("Verify the download CSV button", () => {
        cy.visit(PHYLOMES_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="download-button"]')
            .eq(0)
            .invoke("removeAttr", "target")
            .click({ force: true });
        cy.wait(4000);
        const downloadsFolder = Cypress.config("downloadsFolder");
        cy.task("exists", path.join(downloadsFolder, `phylomes.csv`)).then(
            () => {
                cy.log("File downloaded successfully ");
            },
        );
    });

    it("Verify the download PDF button", () => {
        cy.visit(PHYLOMES_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="download-button"]')
            .eq(1)
            .invoke("removeAttr", "target")
            .click({ force: true });
        cy.wait(4000);
        const downloadsFolder = Cypress.config("downloadsFolder");
        cy.task("exists", path.join(downloadsFolder, `file.pdf`)).then(() => {
            cy.log("File downloaded successfully ");
        });
    });
});
