const ABOUT_URL = "http://localhost:3050/about";

describe("About PMID links tests", () => {
    it("PMID-34718760 link is working", () => {
        cy.visit(ABOUT_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();

        cy.get('[data-cy="PMID-34718760-link"]')
            .invoke("removeAttr", "target")
            .click();
        cy.origin("https://academic.oup.com", () => {
            cy.wait(2000);
            cy.on("uncaught:exception", (err) => {
                return false;
            });
            cy.url().should(
                "contain",
                "https://academic.oup.com/nar/advance-article/doi/10.1093/nar/gkab966/6414570",
            );
        });
    });

    it("PMID-24275491 Article link is working", () => {
        cy.visit(ABOUT_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();

        cy.get('[data-cy="PMID-24275491-link"]')
            .invoke("removeAttr", "target")
            .click();
        cy.origin("https://academic.oup.com", () => {
            cy.wait(2000);
            cy.on("uncaught:exception", (err) => {
                return false;
            });
            cy.url().should(
                "contain",
                "https://academic.oup.com/nar/article/42/D1/D897/1057169",
            );
        });
    });

    it("PMID-21075798 Article link is working", () => {
        cy.visit(ABOUT_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();

        cy.get('[data-cy="PMID-21075798-link"]')
            .invoke("removeAttr", "target")
            .click();
        cy.origin("https://academic.oup.com", () => {
            cy.wait(2000);
            cy.on("uncaught:exception", (err) => {
                return false;
            });
            cy.url().should(
                "contain",
                "https://academic.oup.com/nar/article/39/suppl_1/D556/2506874",
            );
        });
    });

    it("PMID-17962297 Article link is working", () => {
        cy.visit(ABOUT_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();

        cy.get('[data-cy="PMID-17962297-link"]')
            .invoke("removeAttr", "target")
            .click();
        cy.origin("https://academic.oup.com", () => {
            cy.wait(2000);
            cy.on("uncaught:exception", (err) => {
                return false;
            });
            cy.url().should(
                "contain",
                "https://academic.oup.com/nar/article/36/suppl_1/D491/2507569",
            );
        });
    });

    it("PMID-17567924 Article link is working", () => {
        cy.visit(ABOUT_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();

        cy.get('[data-cy="PMID-17567924-link"]')
            .invoke("removeAttr", "target")
            .click();
        cy.origin("http://genomebiology.com", () => {
            cy.wait(2000);
            cy.on("uncaught:exception", (err) => {
                return false;
            });
            cy.url().should(
                "contain",
                "http://genomebiology.com/2007/8/6/R109",
            );
        });
    });

    it("Associated publiation link is working", () => {
        cy.visit(ABOUT_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();

        cy.get('[data-cy="associated-publication-link"]')
            .invoke("removeAttr", "target")
            .click();

        cy.url().should("contain", "http://localhost:3050/phylomes");
    });
});
describe("PhylomeDB team & Contributors", () => {
    it("Diego Fuentes link is working", () => {
        cy.visit(ABOUT_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();

        cy.origin("https://scholar.google.es", () => {
            Cypress.on("uncaught:exception", (err) => {
                console.log("Uncaught exception:", err);
                return false;
            });
        });

        cy.get('[data-cy="diego-fuentes-link"]')
            .invoke("removeAttr", "target")
            .click();
        cy.origin("https://scholar.google.es/citations?user=9WWxbrYAAAAJ&hl=es&oi=ao", () => {
            cy.wait(2000);
            cy.on("uncaught:exception", (err) => {
                return false;
            });
            cy.url().should("contain", "https://scholar.google.es/citations?user=9WWxbrYAAAAJ&hl=es&oi=ao");
        });
    });

    it("Dániel Májer link is working", () => {
        cy.visit(ABOUT_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();

        cy.get('[data-cy="daniel-majer-link"]')
            .invoke("removeAttr", "target")
            .click();
        cy.origin("https://www.bsc.es", () => {
            cy.wait(2000);
            cy.on("uncaught:exception", (err) => {
                return false;
            });
            cy.url().should("contain", "https://www.bsc.es/majer-daniel");
        });
    });

    it("Marina Marcet-Houben link is working", () => {
        cy.visit(ABOUT_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="marina-marcet-houben-link"]')
            .invoke("removeAttr", "target")
            .click();
        cy.origin("https://www.bsc.es", () => {
            cy.wait(2000);
            cy.on("uncaught:exception", (err) => {
                return false;
            });
            cy.url().should(
                "contain",
                "https://www.bsc.es/marcet-houben-marina",
            );
        });
    });

    it("Toni Gabaldón link is working", () => {
        cy.visit(ABOUT_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="toni-gabaldon-link"]')
            .invoke("removeAttr", "target")
            .click();
        cy.origin("https://www.bsc.es", () => {
            cy.wait(2000);
            cy.on("uncaught:exception", (err) => {
                return false;
            });
            cy.url().should("contain", "https://www.bsc.es/gabaldon-toni");
        });
    });

    it("Salvador Capella-Gutierrez link is working", () => {
        cy.visit(ABOUT_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="salvador-capella-gutierrez-link"]')
            .invoke("removeAttr", "target")
            .click();
        cy.origin("https://scholar.google.com", () => {
            cy.wait(2000);
            cy.on("uncaught:exception", (err) => {
                return false;
            });
            cy.url().should(
                "contain",
                "https://scholar.google.com/citations?user=sCFo5z4AAAAJ&hl=en",
            );
        });
    });

    it("Leszek Pryszcz link is working", () => {
        cy.visit(ABOUT_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="leszek-pryszcz-link"]')
            .invoke("removeAttr", "target")
            .click();
        cy.origin("https://www.crg.eu", () => {
            cy.wait(2000);
            cy.on("uncaught:exception", (err) => {
                return false;
            });
            cy.url().should(
                "contain",
                "https://www.crg.eu/en/group-members/leszek-piotr-pryszcz",
            );
        });
    });

    it("Miguel Ángel Naranjo link is working", () => {
        cy.visit(ABOUT_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();

        cy.origin("https://scholar.google.es", () => {
            Cypress.on("uncaught:exception", (err) => {
                console.log("Uncaught exception:", err);
                return false;
            });
        });
        cy.get('[data-cy="miguel-angel-naranjo-link"]')
            .invoke("removeAttr", "target")
            .click();
        cy.origin("https://scholar.google.es", () => {
            cy.wait(2000);
            cy.on("uncaught:exception", (err) => {
                return false;
            });
            cy.url().should(
                "contain",
                "https://scholar.google.es/citations?user=WVEclfoAAAAJ&hl=es",
            );
        });
    });

    it("Laia Carreté link is working", () => {
        cy.visit(ABOUT_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.origin("https://scholar.google.es", () => {
            Cypress.on("uncaught:exception", (err) => {
                console.log("Uncaught exception:", err);
                return false;
            });
        });
        cy.get('[data-cy="laia-carrete-link"]')
            .invoke("removeAttr", "target")
            .click();
        cy.origin("https://scholar.google.es", () => {
            cy.wait(2000);
            cy.on("uncaught:exception", (err) => {
                return false;
            });
            cy.url().should(
                "contain",
                "https://scholar.google.es/citations?user=WtHoc5oAAAAJ",
            );
        });
    });

    it("Jaime Huerta-Cepas link is working", () => {
        cy.visit(ABOUT_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="jaime-huerta-cepas-link"]')
            .invoke("removeAttr", "target")
            .click();
        cy.origin("https://scholar.google.com", () => {
            cy.wait(2000);
            cy.on("uncaught:exception", (err) => {
                return false;
            });
            cy.url().should(
                "contain",
                "https://scholar.google.com/citations?user=lUCR9rIAAAAJ&hl=en",
            );
        });
    });

    it("Uciel Chorostecki link is working", () => {
        cy.visit(ABOUT_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="uciel-chorostecki-link"]')
            .invoke("removeAttr", "target")
            .click();
        cy.origin("https://scholar.google.com", () => {
            cy.wait(2000);
            cy.on("uncaught:exception", (err) => {
                return false;
            });
            cy.url().should(
                "contain",
                "https://scholar.google.com/citations?user=k2ijrokAAAAJ&hl=en&oi=ao",
            );
        });
    });
});

describe("PhylomeDB uses buttons test", () => {
    it("Ete cgenomics link is working", () => {
        cy.visit(ABOUT_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="ete-cgenomics-link"]')
            .invoke("removeAttr", "target")
            .click();
        cy.wait(6000);
        cy.origin("http://ete.cgenomics.org/", () => {
            cy.wait(2000);
            cy.on("uncaught:exception", (err) => {
                return false;
            });
            cy.url().should("contain", "http://ete.cgenomics.org/");
        });
    });

    it("TrimAl link is working", () => {
        cy.visit(ABOUT_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="trimal-link-button"]')
            .invoke("removeAttr", "target")
            .click();
        cy.origin("https://trimal.cgenomics.org/", () => {
            cy.wait(2000);
            cy.on("uncaught:exception", (err) => {
                return false;
            });
            cy.url().should("contain", "https://trimal.cgenomics.org/");
        });
    });

    it("Jalview link is working", () => {
        cy.visit(ABOUT_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[ data-cy="jalview-link-button"]')
            .invoke("removeAttr", "target")
            .click();
        cy.origin("https://www.jalview.org/", () => {
            cy.wait(2000);
            cy.on("uncaught:exception", (err) => {
                return false;
            });
            cy.url().should("contain", "https://www.jalview.org/");
        });
    });

    it("Uniprot link is working", () => {
        cy.visit(ABOUT_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="uniprot-link-button"]')
            .invoke("removeAttr", "target")
            .click();
        cy.origin("https://www.uniprot.org/", () => {
            cy.wait(2000);
            cy.on("uncaught:exception", (err) => {
                return false;
            });
            cy.url().should("contain", "https://www.uniprot.org/");
        });
    });

    it("Ensembl link is working", () => {
        cy.visit(ABOUT_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="ensembl-link-button"]')
            .invoke("removeAttr", "target")
            .click();
        cy.origin("https://www.ensembl.org/index.html", () => {
            cy.wait(2000);
            cy.on("uncaught:exception", (err) => {
                return false;
            });
            cy.url().should("contain", "https://www.ensembl.org/index.html");
        });
    });

    it("SGD link is working", () => {
        cy.visit(ABOUT_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();

        cy.origin("https://www.yeastgenome.org/", () => {
            Cypress.on("uncaught:exception", (err) => {
                console.log("Uncaught exception:", err);
                return false;
            });
        });
        cy.get('[data-cy="sgd-link-button"]')
            .invoke("removeAttr", "target")
            .click();
        cy.origin("https://www.yeastgenome.org/", () => {
            cy.wait(2000);
            cy.on("uncaught:exception", (err) => {
                return false;
            });
            cy.url().should("contain", "https://www.yeastgenome.org/");
        });
    });

    it("CGD link is working", () => {
        cy.visit(ABOUT_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="cgd-link-button"]')
            .invoke("removeAttr", "target")
            .click();
        cy.origin("http://www.candidagenome.org/", () => {
            cy.wait(2000);
            cy.on("uncaught:exception", (err) => {
                return false;
            });
            cy.url().should("contain", "http://www.candidagenome.org/");
        });
    });

    it("Genolevures link is working", () => {
        cy.visit(ABOUT_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="genolevures-link-button"]')
            .invoke("removeAttr", "target")
            .click();
        cy.origin("http://www.genolevures.org/", () => {
            cy.wait(2000);
            cy.on("uncaught:exception", (err) => {
                return false;
            });
            cy.url().should("contain", "http://www.genolevures.org/");
        });
    });

    it("Acypicyc link is working", () => {
        cy.visit(ABOUT_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="acypicyc-link-button"]')
            .invoke("removeAttr", "target")
            .click();
        cy.origin("https://acypicyc.cycadsys.org/", () => {
            cy.wait(2000);
            cy.on("uncaught:exception", (err) => {
                return false;
            });
            cy.url().should("contain", "https://acypicyc.cycadsys.org/");
        });
    });

    it("Treefam link is working", () => {
        cy.visit(ABOUT_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="treefam-link-button"]')
            .invoke("removeAttr", "target")
            .click();
        cy.origin("http://www.treefam.org/", () => {
            cy.wait(2000);
            cy.on("uncaught:exception", (err) => {
                return false;
            });
            cy.url().should("contain", "http://www.treefam.org/");
        });
    });
});
