import path from "path";

const TEST_TOKEN = Cypress.env("TEST_USER_TOKEN");
const LOGIN_URL = "http://localhost:3050/login";

const login = () => {
    cy.visit(`${LOGIN_URL}?login_token=${TEST_TOKEN}`);
    cy.wait(3000);
};


describe("Add new News element ", () => {
    beforeEach(() => {
        login();
        cy.visit("http://localhost:3050/");
    });
    it("New news button works", () => {
        cy.get('[data-cy="cookie-accept-button"]')
            .first()
            .click({ force: true });
        cy.get('[data-cy="new-post-news-button"]').first().click();
        cy.url().should("contain", "http://localhost:3050/news/create");
    });

    it("Try to create a invalid news with empty title and description", () => {
        cy.get('[data-cy="cookie-accept-button"]')
            .first()
            .click({ force: true });
        cy.get('[data-cy="new-post-news-button"]').first().click();
        cy.url().should("contain", "http://localhost:3050/news/create");
        cy.get('[data-cy="confirm-create-button"]').click();
        cy.get('[data-cy="error-message-window"]').should(
            "contain",
            "Invalid formdata was received! Missing 'title'.",
        );
    });

    it("Try to create a invalid news with empty description", () => {
        cy.get('[data-cy="cookie-accept-button"]')
            .first()
            .click({ force: true });
        cy.get('[data-cy="new-post-news-button"]').first().click();
        cy.url().should("contain", "http://localhost:3050/news/create");
        cy.get('[data-cy="input-title"]').clear().type("title-test");
        cy.get('[data-cy="confirm-create-button"]').click();
        cy.get('[data-cy="error-message-window"]').should(
            "contain",
            "Invalid formdata was received! Missing 'description'.",
        );
    });

    it("Try to create a invalid news with empty title", () => {
        cy.get('[data-cy="cookie-accept-button"]')
            .first()
            .click({ force: true });
        cy.get('[data-cy="new-post-news-button"]').first().click();
        cy.url().should("contain", "http://localhost:3050/news/create");
        cy.get('[data-cy="input-description"]').clear().type("desc-test");
        cy.get('[data-cy="confirm-create-button"]').click();
        cy.get('[data-cy="error-message-window"]').should(
            "contain",
            "Invalid formdata was received! Missing 'title'.",
        );
    });

    it("Try to create a invalid news with empty title", () => {
        cy.get('[data-cy="cookie-accept-button"]')
            .first()
            .click({ force: true });
        cy.get('[data-cy="new-post-news-button"]').first().click();
        cy.url().should("contain", "http://localhost:3050/news/create");
        cy.get('[data-cy="input-description"]').clear().type("desc-test");
        cy.get('[data-cy="input-title"]').clear().type("title-test");
        cy.get('[data-cy="confirm-create-button"]').click();
        cy.get('[data-cy="error-message-window"]').should(
            "contain",
            "Invalid formdata was received! Missing 'content'.",
        );
    });

    it("Try to create a invalid news with empty content", () => {
        cy.get('[data-cy="cookie-accept-button"]')
            .first()
            .click({ force: true });
        cy.get('[data-cy="new-post-news-button"]').first().click();
        cy.url().should("contain", "http://localhost:3050/news/create");
        cy.get('[data-cy="input-description"]').clear().type("desc-test");
        cy.get('[data-cy="input-title"]').clear().type("title-test");
        cy.get('[data-cy="confirm-create-button"]').click();
        cy.get('[data-cy="error-message-window"]').should(
            "contain",
            "Invalid formdata was received! Missing 'content'.",
        );
    });

    it("Try to create a valid news article ", () => {
        cy.get('[data-cy="cookie-accept-button"]')
            .first()
            .click({ force: true });
        cy.get('[data-cy="new-post-news-button"]').first().click();
        cy.url().should("contain", "http://localhost:3050/news/create");
        cy.get('[data-cy="input-description"]').clear().type("desc-test");
        cy.get('[data-cy="input-title"]').clear().type("title-test");
        cy.get('[class="tiptap ProseMirror"]').clear().type("content-test");
        cy.get('[data-cy="confirm-create-button"]').click();
        cy.get('[data-cy="success-message-window"]').should(
            "contain",
            "Successfully created new post!",
        );
    });
});

describe("News table ", () => {
    beforeEach(() => {
        login();
        cy.visit("http://localhost:3050/");
        cy.get('[href="/news/all"]').click();
    });
    it("Verify the download CSV button", () => {
        cy.get('[data-cy="cookie-accept-button"]')
            .first()
            .click({ force: true });
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
        cy.get('[data-cy="cookie-accept-button"]')
            .first()
            .click({ force: true });
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

    it("Verify id button redirects correctly", () => {
        cy.get('[data-cy="cookie-accept-button"]')
            .first()
            .click({ force: true });
        cy.get('[data-cy="newsid-button"]')
            .should("exist")
            .then(() => {
                cy.get('[data-cy="newsid-button"]').first().click();
                cy.url().should("contain", "http://localhost:3050/news/get");
            });
    });
});


describe("Modify News element ", () => {
    beforeEach(() => {
        login();
        cy.visit("http://localhost:3050/");
    });

    it("more info news button works", () => {
        cy.get('[data-cy="cookie-accept-button"]')
            .first()
            .click({ force: true });
        cy.get('[data-cy="more-info-news"]')
            .invoke("attr", "custom-value")
            .then((value) => {
                cy.get('[data-cy="more-info-news"]').first().click();
                cy.url().should(
                    "contain",
                    `http://localhost:3050/news/get/${value}`,
                );
            });
    });

    it("more info news button works", () => {
        cy.get('[data-cy="cookie-accept-button"]')
            .first()
            .click({ force: true });
        cy.get('[data-cy="title-link"]')
            .invoke("attr", "custom-value")
            .then((value) => {
                cy.get('[data-cy="title-link"]').first().click();
                cy.url().should(
                    "contain",
                    `http://localhost:3050/news/get/${value}`,
                );
            });
    });

    it("Update button without do any change", () => {
        cy.get('[data-cy="cookie-accept-button"]')
            .first()
            .click({ force: true });
        cy.get('[data-cy="title-link"]')
            .invoke("attr", "custom-value")
            .then((value) => {
                cy.get('[data-cy="title-link"]').first().click();
                cy.url().should(
                    "contain",
                    `http://localhost:3050/news/get/${value}`,
                );
            });
        cy.get('[data-cy="update-button"]').click();
        cy.get('[data-cy="error-message-window"]').should(
            "contain",
            "No changes detected. Please modify at least one field.",
        );
    });

    it("Update button without do any change", () => {
        cy.get('[data-cy="cookie-accept-button"]')
            .first()
            .click({ force: true });
        cy.get('[data-cy="title-link"]')
            .invoke("attr", "custom-value")
            .then((value) => {
                cy.get('[data-cy="title-link"]').first().click();
                cy.url().should(
                    "contain",
                    `http://localhost:3050/news/get/${value}`,
                );
            });
        cy.get('[data-cy="update-button"]').click();
        cy.get('[data-cy="error-message-window"]').should(
            "contain",
            "No changes detected. Please modify at least one field.",
        );
    });

    it("try to update with all fields empty", () => {
        cy.get('[data-cy="cookie-accept-button"]')
            .first()
            .click({ force: true });
        cy.get('[data-cy="title-link"]')
            .invoke("attr", "custom-value")
            .then((value) => {
                cy.get('[data-cy="title-link"]').first().click();
                cy.url().should(
                    "contain",
                    `http://localhost:3050/news/get/${value}`,
                );
            });
        cy.get('[data-cy="title-input"]').clear();
        cy.get('[data-cy="description-input"]').clear();
        cy.get('[class="tiptap ProseMirror"]').clear();
        cy.get('[data-cy="update-button"]').click();
        cy.get('[data-cy="error-message-window"]').should(
            "contain",
            "Invalid formdata was received! Missing 'title'.",
        );
    });

    it("try to update with content and description fields empty", () => {
        cy.get('[data-cy="cookie-accept-button"]')
            .first()
            .click({ force: true });
        cy.get('[data-cy="title-link"]')
            .invoke("attr", "custom-value")
            .then((value) => {
                cy.get('[data-cy="title-link"]').first().click();
                cy.url().should(
                    "contain",
                    `http://localhost:3050/news/get/${value}`,
                );
            });
        cy.get('[data-cy="title-input"]').clear().type("new-title-test");
        cy.get('[data-cy="description-input"]').clear();
        cy.get('[class="tiptap ProseMirror"]').clear();
        cy.get('[data-cy="update-button"]').click();
        cy.get('[data-cy="error-message-window"]').should(
            "contain",
            "Invalid formdata was received! Missing 'description'.",
        );
    });

    it("try to update with content field empty", () => {
        cy.get('[data-cy="cookie-accept-button"]')
            .first()
            .click({ force: true });
        cy.get('[data-cy="title-link"]')
            .invoke("attr", "custom-value")
            .then((value) => {
                cy.get('[data-cy="title-link"]').first().click();
                cy.url().should(
                    "contain",
                    `http://localhost:3050/news/get/${value}`,
                );
            });
        cy.get('[data-cy="title-input"]').clear().type("new-title-test");
        cy.get('[data-cy="description-input"]')
            .clear()
            .type("new-test-description");
        cy.get('[class="tiptap ProseMirror"]').clear();
        cy.get('[data-cy="update-button"]').click();
        cy.get('[data-cy="success-message-window"]').should(
            "contain",
            "Successfully update post!",
        );
    });

    it("try to update with all valid data", () => {
        cy.get('[data-cy="cookie-accept-button"]')
            .first()
            .click({ force: true });
        cy.get('[data-cy="title-link"]')
            .invoke("attr", "custom-value")
            .then((value) => {
                cy.get('[data-cy="title-link"]').first().click();
                cy.url().should(
                    "contain",
                    `http://localhost:3050/news/get/${value}`,
                );
            });
        cy.get('[data-cy="title-input"]').clear().type("new-title-test");
        cy.get('[data-cy="description-input"]')
            .clear()
            .type("new-description-test");
        cy.get('[class="tiptap ProseMirror"]').clear().type("new-content-test");
        cy.get('[data-cy="update-button"]').click();
        cy.get('[data-cy="success-message-window"]').should(
            "contain",
            "Successfully update post!",
        );

        cy.get('[data-cy="title-link"]')
            .filter(':contains("new-title-test")')
            .should("exist");
    });

    it("try to delete existing new", () => {
        cy.get('[data-cy="cookie-accept-button"]')
            .first()
            .click({ force: true });
        cy.get('[data-cy="title-link"]')
            .invoke("attr", "custom-value")
            .then((value) => {
                cy.get('[data-cy="title-link"]').first().click();
                cy.url().should(
                    "contain",
                    `http://localhost:3050/news/get/${value}`,
                );
            });

        cy.get('[data-cy="delete-button"]').click();
        cy.url().should("contain", "http://localhost:3050/news/all");
    });
});
