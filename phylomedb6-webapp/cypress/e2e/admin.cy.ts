describe("Private phylomes tests", () => {
    const ADMIN_PAGE_URL = "http://localhost:3050/admin";
    const TEST_TOKEN = Cypress.env("TEST_USER_TOKEN");
    const LOGIN_URL = "http://localhost:3050/login";

    const login = () => {
        cy.visit(`${LOGIN_URL}?login_token=${TEST_TOKEN}`);
        cy.wait(3000);
    };

    beforeEach(() => {
        login();
        cy.visit(ADMIN_PAGE_URL);
    });

    it("Try to insert none private phylome ", () => {
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="toggle-phylomes-menu-button"]').click();
        cy.get('[data-cy="add-new-phylome-input"]').type("8");
        cy.get('[data-cy="add-phylome-button"]').click();
        cy.get('[data-cy="error-message-window"]').should(
            "contain",
            "The phylome 8 is public and cannot be added",
        );
    });

    it("Try to insert none existing phylome ", () => {
        const PHYLOME = "99999999";
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="toggle-phylomes-menu-button"]').click();
        cy.get('[data-cy="add-new-phylome-input"]').type(PHYLOME);
        cy.get('[data-cy="add-phylome-button"]').click();
        cy.get('[data-cy="error-message-window"]').should(
            "contain",
            `Phylome with id ${PHYLOME} does not exist`,
        );
    });

    it("Try to insert private phylome if its not inserted yet", () => {
        const PHYLOME = "4";
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="toggle-phylomes-menu-button"]').click();
        cy.get('[data-cy="add-new-phylome-input"]').type(PHYLOME);
        cy.get('[data-cy="add-phylome-button"]').click();
        cy.get('[data-cy="success-message-window"]').should(
            "contain",
            `Phylome with id ${PHYLOME} added succesfully`,
        );
    });

    it("Try to insert already inserted phylome", () => {
        const PHYLOME = "4";
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="toggle-phylomes-menu-button"]').click();
        cy.get('[data-cy="add-new-phylome-input"]').type(PHYLOME);
        cy.get('[data-cy="add-phylome-button"]').click();
        cy.get('[data-cy="error-message-window"]').should(
            "contain",
            `The phylome with id ${PHYLOME} is already inserted.`,
        );
    });

    it("Try to reset all selections phylomes", () => {
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="toggle-phylomes-menu-button"]').click();
        cy.get('[data-cy="phylome-selector-label"]').first().click();
        cy.get('[data-cy="reset-selections-button"]').click();
        cy.get('[data-cy="phylome-checkbox"]').should("not.be.checked");
    });

    it("Try to add users to phylome", () => {
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="toggle-phylomes-menu-button"]').click();
        cy.get('[data-cy="phylome-selector-label"]')
            .first()
            .invoke("attr", "custom-value")
            .then((value) => {
                cy.get('[data-cy="phylome-selector-label"]').first().click();
                cy.get('[data-cy="select-phylomes-action"]').select("add");
                cy.get('[data-cy="confirm-phylomes-action-button"]').click();
                cy.url().should(
                    "include",
                    `http://localhost:3050/admin/phylomes?selected=${encodeURIComponent(
                        `[${value}]`,
                    )}`,
                );
            });
    });

    it("Try to search  phylome", () => {
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="toggle-phylomes-menu-button"]').click();
        cy.get('[data-cy="phylome-selector-label"]')
            .first()
            .invoke("attr", "custom-value")
            .then((value) => {
                cy.get('[data-cy="searchbar-phylomes"]').type(
                    value ? value : "",
                );
                cy.get('[data-cy="phylome-selector-label"]')
                    .first()
                    .should("contain", value);
            });
    });

    it("Try to delete inserted phylome", () => {
        const PHYLOME = "4";
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="toggle-phylomes-menu-button"]').click();
        cy.get('[data-cy="phylome-selector-label"]')
            .first()
            .invoke("attr", "custom-value")
            .then((value) => {
                cy.get('[data-cy="phylome-selector-label"]').first().click();
                cy.get('[data-cy="select-phylomes-action"]').select("delete");
                cy.get('[data-cy="confirm-phylomes-action-button"]').click();
                cy.get('[data-cy="success-message-window"]').should(
                    "contain",
                    `Phylome with id ${value} deleted successfully`,
                );
            });
    });
});

describe("Manage registered users tests", () => {
    const ADMIN_PAGE_URL = "http://localhost:3050/admin";
    const TEST_TOKEN = Cypress.env("TEST_USER_TOKEN");
    const LOGIN_URL = "http://localhost:3050/login";
    const PRIVATE_PHYLOMES_URL ="http://localhost:3050/admin/phylomes?selected=%5B4%5D";

    const login = () => {
        cy.visit(`${LOGIN_URL}?login_token=${TEST_TOKEN}`);
        cy.wait(3000);
    };

    beforeEach(() => {
        login();
        cy.visit(ADMIN_PAGE_URL);
    });

    it("Add new user to phylome", () => {
        cy.visit(`${LOGIN_URL}?login_token=${TEST_TOKEN}`);
        cy.wait(3000);
        cy.visit(PRIVATE_PHYLOMES_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="add-new-user-to-phylome-button"]').click();
        cy.get('[data-cy="add-new-email-input"]')
            .clear()
            .type("test@gmail.com");
        cy.get('[data-cy="confirm-add-new-email-button"]').click();
        cy.get('[data-cy="success-window"]').should(
            "contain",
            "test@gmail.com added succesfully",
        );
    });

    it("try search by mail", () => {
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="toggle-users-menu-button"]').click();
        cy.wait(3000);
        cy.get("body").then(($body) => {
            if ($body.find('[data-cy="email-name-user-button"]').length > 0) {
                cy.get('[data-cy="email-name-user-button"]').should("exist");
            } else {
                throw new Error(
                    "No emails found pass create one for do the test... skipping",
                );
            }
        });
    });

    it("Search user by email field is working", () => {
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="toggle-users-menu-button"]').click();
        cy.get('[data-cy="select-search-filter-user"]').select("email");
        cy.get("body").then(($body) => {
            if ($body.find('[data-cy="email-name-user-button"]').length > 0) {
                cy.get('[data-cy="email-name-user-button"]')
                    .first()
                    .invoke("attr", "email-value")
                    .then((value) => {
                        cy.get('[data-cy="searchbar-users-input"]').type(
                            `${value}`,
                        );
                        cy.get('[data-cy="email-name-user-button"]').should(
                            "have.text",
                            `Email: ${value}`,
                        );
                    });
            } else {
                throw new Error(
                    "No emails found pass create one for do the test... skipping",
                );
            }
        });
    });

    it("Modify user  for all phylomes button is working (valid data) email/name fields at once", () => {
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="toggle-users-menu-button"]').click();
        cy.get("body").then(($body) => {
            if ($body.find('[data-cy="email-name-user-button"]').length > 0) {
                cy.get('[data-cy="email-name-user-button"]').first().click();
                cy.get('[data-cy="modify-user-all-phylomes-button"]').click();
                cy.get('[data-cy="new-email-input"]')
                    .invoke("attr", "value")
                    .then((value) => {
                        cy.get('[data-cy="new-email-input"]')
                            .clear()
                            .type("test@gmail.com");
                        cy.get('[data-cy="new-name-input"]')
                            .clear()
                            .type("test");
                        cy.get(
                            '[data-cy="confirm-modify-user-button"]',
                        ).click();
                        cy.get('[data-cy="success-window"]').should(
                            "contain",
                            `User ${value} modified successfully`,
                        );
                    });
            } else {
                throw new Error(
                    "No emails found pass create one for do the test... skipping",
                );
            }
        });
    });


    it("Search user by name field is working", () => {
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="toggle-users-menu-button"]').click();
        cy.get('[data-cy="select-search-filter-user"]').select("name");
        cy.get("body").then(($body) => {
            if ($body.find('[data-cy="email-name-user-button"]').length > 0) {
                cy.get('[data-cy="email-name-user-button"]')
                    .first()
                    .invoke("attr", "name-value")
                    .then((value) => {
                        cy.get('[data-cy="searchbar-users-input"]').type(
                            `${value}`,
                        );
                        cy.get('[data-cy="email-name-user-button"]')
                            .first()
                            .should("have.text", `Name: ${value}`);
                    });
            } else {
                throw new Error(
                    "No emails found pass create one for do the test... skipping",
                );
            }
        });
    });


    
    it("Try to modify user with empty fields", () => {
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="toggle-users-menu-button"]').click();
        cy.get("body").then(($body) => {
            if ($body.find('[data-cy="email-name-user-button"]').length > 0) {
                cy.get('[data-cy="email-name-user-button"]').first().click();
                cy.get('[data-cy="modify-user-all-phylomes-button"]').click();
                cy.get('[data-cy="new-email-input"]')
                    .invoke("attr", "value")
                    .then((value) => {
                        cy.get('[data-cy="new-email-input"]').clear();
                        cy.get('[data-cy="new-name-input"]').clear();
                        cy.get(
                            '[data-cy="confirm-modify-user-button"]',
                        ).click();
                        cy.get('[data-cy="success-window"]').should(
                            "not.exist",
                        );
                    });
            } else {
                throw new Error(
                    "No emails found pass create one for do the test... skipping",
                );
            }
        });
    });

    it("Try to modify user with empty email", () => {
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="toggle-users-menu-button"]').click();
        cy.get("body").then(($body) => {
            if ($body.find('[data-cy="email-name-user-button"]').length > 0) {
                cy.get('[data-cy="email-name-user-button"]').first().click();
                cy.get('[data-cy="modify-user-all-phylomes-button"]').click();
                cy.get('[data-cy="new-email-input"]')
                    .invoke("attr", "value")
                    .then((value) => {
                        cy.get('[data-cy="new-email-input"]').clear();
                        cy.get('[data-cy="new-name-input"]')
                            .clear()
                            .type("test");
                        cy.get(
                            '[data-cy="confirm-modify-user-button"]',
                        ).click();
                        cy.get('[data-cy="success-window"]').should(
                            "not.exist",
                        );
                    });
            } else {
                throw new Error(
                    "No emails found pass create one for do the test... skipping",
                );
            }
        });
    });

    it("Try to modify user with not valid  email format", () => {
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="toggle-users-menu-button"]').click();
        cy.get("body").then(($body) => {
            if ($body.find('[data-cy="email-name-user-button"]').length > 0) {
                cy.get('[data-cy="email-name-user-button"]').first().click();
                cy.get('[data-cy="modify-user-all-phylomes-button"]').click();
                cy.get('[data-cy="new-email-input"]')
                    .invoke("attr", "value")
                    .then((value) => {
                        cy.get('[data-cy="new-email-input"]')
                            .clear()
                            .type("test");
                        cy.get('[data-cy="new-name-input"]')
                            .clear()
                            .type("test");
                        cy.get(
                            '[data-cy="confirm-modify-user-button"]',
                        ).click();
                        cy.get('[data-cy="success-window"]').should(
                            "not.exist",
                        );
                    });
            } else {
                throw new Error(
                    "No emails found pass create one for do the test... skipping",
                );
            }
        });
    });

    

    it("Show linked phylomes search bar is working", () => {
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="toggle-users-menu-button"]').click();
        cy.get("body").then(($body) => {
            if ($body.find('[data-cy="email-name-user-button"]').length > 0) {
                cy.get('[data-cy="email-name-user-button"]').first().click();
                cy.get('[data-cy="show-linked-phylomes-button"]').click();
                cy.get("body").then(($body) => {
                    if (
                        $body.find('[data-cy="phylomes-linked-modal"]').length <
                        1
                    ) {
                        throw new Error("Modal not found test not passed!");
                    } else {
                        cy.get('[data-cy="phylome-button-phylomes-linked"]')
                            .invoke("attr", "value")
                            .then((value) => {
                                cy.get(
                                    '[data-cy="search-bar-linked-phylomes-modal"]',
                                ).type(`${value}`);
                                cy.get(
                                    '[data-cy="phylome-button-phylomes-linked"]',
                                )
                                    .first()
                                    .should("contain", value);
                            });
                    }
                });
            } else {
                throw new Error(
                    "No emails found pass create one for do the test... skipping",
                );
            }
        });
    });

    it("Show linked phylomes phylome filtered button is working and redirects to the correct page", () => {
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="toggle-users-menu-button"]').click();
        cy.get("body").then(($body) => {
            if ($body.find('[data-cy="email-name-user-button"]').length > 0) {
                cy.get('[data-cy="email-name-user-button"]').first().click();
                cy.get('[data-cy="show-linked-phylomes-button"]').click();
                cy.get("body").then(($body) => {
                    if (
                        $body.find('[data-cy="phylomes-linked-modal"]').length <
                        1
                    ) {
                        throw new Error("Modal not found test not passed!");
                    } else {
                        cy.get('[data-cy="phylome-button-phylomes-linked"]')
                            .invoke("attr", "value")
                            .then((value) => {
                                cy.get(
                                    '[data-cy="search-bar-linked-phylomes-modal"]',
                                ).type(`${value}`);
                                cy.get(
                                    '[data-cy="phylome-button-phylomes-linked"]',
                                )
                                    .first()
                                    .click();
                                cy.url().should(
                                    "include",
                                    `http://localhost:3050/admin/phylomes?selected=${encodeURIComponent(
                                        `[${value}]`,
                                    )}`,
                                );
                            });
                    }
                });
            } else {
                throw new Error(
                    "No emails found pass create one for do the test... skipping",
                );
            }
        });
    });

    
    it("Test all BACK registered users buttons", () => {
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="toggle-users-menu-button"]').click();
        cy.get("body").then(($body) => {
            if ($body.find('[data-cy="email-name-user-button"]').length > 0) {
                cy.get('[data-cy="email-name-user-button"]').first().click();
                //Modify user for all phylomes back button test
                cy.get('[data-cy="modify-user-all-phylomes-button"]').click();
                cy.get('[data-cy="modify-user-back-button"]').click();
                cy.get('[data-cy="user-settings-modal"]').should("exist");
                //Show linked phylomes back button test
                cy.get('[data-cy="show-linked-phylomes-button"]').click();
                cy.get('[data-cy="linked-phylomes-back-button"]').click();
                cy.get('[data-cy="user-settings-modal"]').should("exist");
                //Remove user from all phylomes
                cy.get('[data-cy="delete-user-button"]').click();
                cy.get(
                    '[data-cy="delete-user-from-all-phylomes-back-button"]',
                ).click();
                cy.get('[data-cy="user-settings-modal"]').should("exist");
            } else {
                throw new Error(
                    "No emails found pass create one for do the test... skipping",
                );
            }
        });
    });
   

    it("Delete email from all phylomes is working and shows the correct messages", () => {
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="toggle-users-menu-button"]').click();
        cy.get("body").then(($body) => {
            if ($body.find('[data-cy="email-name-user-button"]').length > 0) {
                cy.get('[data-cy="email-name-user-button"]').first().click();
                cy.get('[data-cy="delete-user-button"]').click();
                cy.get("body").then(($body) => {
                    if (
                        $body.find('[data-cy="delete-user-modal"]').length < 1
                    ) {
                        throw new Error("Modal not found test not passed!");
                    } else {
                        cy.get('[data-cy="confirm-delete-user-button"]')
                            .invoke("attr", "custom-value")
                            .then((value) => {
                                cy.get('[data-cy="confirm-delete-user-button"]')
                                    .invoke("attr", "user-email")
                                    .then((email) => {
                                        cy.get(
                                            '[data-cy="confirm-delete-user-button"]',
                                        ).click();
                                        cy.on("window:alert", (text) => {
                                            expect(text).to.eq(
                                                `The user ${email} is assigned to the following phylomes: (${value}). Do you want to proceed with deletion?`,
                                            );
                                        });
                                        cy.log(email!);
                                        cy.get(
                                            '[data-cy="success-window"]',
                                        ).should(
                                            "contain",
                                            `${email} deleted successfully`,
                                        );
                                    });
                            });
                    }
                });
            } else {
                throw new Error(
                    "No emails found pass create one for do the test... skipping",
                );
            }
        });
    });

});

describe("Manage administrators users tests", () => {
    const ADMIN_PAGE_URL = "http://localhost:3050/admin";
    const TEST_TOKEN = Cypress.env("TEST_USER_TOKEN");
    const LOGIN_URL = "http://localhost:3050/login";

    const login = () => {
        cy.visit(`${LOGIN_URL}?login_token=${TEST_TOKEN}`);
        cy.wait(3000);
    };

    beforeEach(() => {
        login();
        cy.visit(ADMIN_PAGE_URL);
    });

    it("Add new admin user modal turns visible", () => {
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="toggle-admin-menu-button"]').click();
        cy.get('[data-cy="create-new-admin-user-button"]').click();
        cy.get("body").then(($body) => {
            if ($body.find('[data-cy="add-admin-user-modal"]').length < 1) {
                throw new Error("Add new admin user modal not found!");
            } else {
            }
        });
    });

    it("Add new admin user when no data inserted in inputs", () => {
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="toggle-admin-menu-button"]').click();
        cy.get('[data-cy="create-new-admin-user-button"]').click();
        cy.get("body").then(($body) => {
            if ($body.find('[data-cy="add-admin-user-modal"]').length < 1) {
                throw new Error("Add new admin user modal not found!");
            } else {
                cy.get('[data-cy="confirm-add-new-admin-user-button"]').click();
                cy.get('[data-cy="success-window"]').should("not.exist");
            }
        });
    });

    it("Try to add new admin user with invalid format email", () => {
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="toggle-admin-menu-button"]').click();
        cy.get('[data-cy="create-new-admin-user-button"]').click();
        cy.get("body").then(($body) => {
            if ($body.find('[data-cy="add-admin-user-modal"]').length < 1) {
                throw new Error("Add new admin user modal not found!");
            } else {
                cy.get('[data-cy="email-input-admin"]').clear().type("test");
                cy.get('[data-cy="name-input-admin"]').clear().type("test");
                cy.get('[data-cy="confirm-add-new-admin-user-button"]').click();
                cy.get('[data-cy="success-window"]').should("not.exist");
            }
        });
    });

    it("Try to add new admin user with no email given", () => {
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="toggle-admin-menu-button"]').click();
        cy.get('[data-cy="create-new-admin-user-button"]').click();
        cy.get("body").then(($body) => {
            if ($body.find('[data-cy="add-admin-user-modal"]').length < 1) {
                throw new Error("Add new admin user modal not found!");
            } else {
                cy.get('[data-cy="email-input-admin"]').clear();
                cy.get('[data-cy="name-input-admin"]').clear().type("test");
                cy.get('[data-cy="confirm-add-new-admin-user-button"]').click();
                cy.get('[data-cy="success-window"]').should("not.exist");
            }
        });
    });
    it("Try to add new admin user with valid data", () => {
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="toggle-admin-menu-button"]').click();
        cy.get('[data-cy="create-new-admin-user-button"]').click();
        cy.get("body").then(($body) => {
            if ($body.find('[data-cy="add-admin-user-modal"]').length < 1) {
                throw new Error("Add new admin user modal not found!");
            } else {
                cy.get('[data-cy="email-input-admin"]')
                    .clear()
                    .type("phylomedb@test.test");
                cy.get('[data-cy="name-input-admin"]').clear().type("test");
                cy.get('[data-cy="confirm-add-new-admin-user-button"]').click();
                cy.get('[data-cy="success-window"]').should(
                    "contain",
                    `Admin user phylomedb@test.test added successfully`,
                );
            }
        });
    });

    it("Test if search bar (by email) is working", () => {
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="toggle-admin-menu-button"]').click();
        cy.get('[data-cy="select-filter-search-admin"]').select("email", {
            force: true,
        });
        cy.get('[data-cy="searchbar-email-name-input"]').type(
            "phylomedb@test.test",
        );
        cy.get('[data-cy="email-name-div-filtered"]')
            .first()
            .should("contain", "Email: phylomedb@test.test");
    });

    it("Test if search bar (by name) is working", () => {
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="toggle-admin-menu-button"]').click();
        cy.get('[data-cy="select-filter-search-admin"]').select("name", {
            force: true,
        });
        cy.get('[data-cy="searchbar-email-name-input"]').type("test");
        cy.get('[data-cy="email-name-div-filtered"]')
            .first()
            .should("contain", "Name: test");
    });

    it("test to modify admin email with invalid email format", () => {
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="toggle-admin-menu-button"]').click();
        cy.get('[data-cy="select-filter-search-admin"]').select("email", {
            force: true,
        });
        cy.get('[data-cy="searchbar-email-name-input"]').type(
            "phylomedb@test.test",
        );
        cy.get('[data-cy="email-name-div-filtered"]').first().click();
        cy.get('[data-cy="modify-admin-user-button"]').click();
        cy.get('[data-cy="email-input-admin"]').clear().type("phylomedbtest");
        cy.get('[data-cy="confirm-update-button"]').click();
        cy.get('[data-cy="success-window"]').should("not.exist");
    });

    it("test to modify admin email with empty input email field", () => {
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="toggle-admin-menu-button"]').click();
        cy.get('[data-cy="select-filter-search-admin"]').select("email", {
            force: true,
        });
        cy.get('[data-cy="searchbar-email-name-input"]').type(
            "phylomedb@test.test",
        );
        cy.get('[data-cy="email-name-div-filtered"]').first().click();
        cy.get('[data-cy="modify-admin-user-button"]').click();
        cy.get('[data-cy="email-input-admin"]').clear();
        cy.get('[data-cy="confirm-update-button"]').click();
        cy.get('[data-cy="success-window"]').should("not.exist");
    });

    it("test to modify admin email with empty name and email fields", () => {
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="toggle-admin-menu-button"]').click();
        cy.get('[data-cy="select-filter-search-admin"]').select("email", {
            force: true,
        });
        cy.get('[data-cy="searchbar-email-name-input"]').type(
            "phylomedb@test.test",
        );
        cy.get('[data-cy="email-name-div-filtered"]').first().click();
        cy.get('[data-cy="modify-admin-user-button"]').click();
        cy.get('[data-cy="email-input-admin"]').clear();
        cy.get('[data-cy="confirm-update-button"]').click();
        cy.get('[data-cy="success-window"]').should("not.exist");
    });

    it("test to modify admin email with empty input name field", () => {
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="toggle-admin-menu-button"]').click();
        cy.get('[data-cy="select-filter-search-admin"]').select("email", {
            force: true,
        });
        cy.get('[data-cy="searchbar-email-name-input"]').type(
            "phylomedb@test.test",
        );
        cy.get('[data-cy="email-name-div-filtered"]').first().click();
        cy.get('[data-cy="modify-admin-user-button"]').click();
        cy.get('[data-cy="name-input-admin"]').clear();
        cy.get('[data-cy="confirm-update-button"]').click();
        cy.get('[data-cy="success-window"]').should("not.exist");
    });

    it("test to modify admin email with same initial data", () => {
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="toggle-admin-menu-button"]').click();
        cy.get('[data-cy="select-filter-search-admin"]').select("email", {
            force: true,
        });
        cy.get('[data-cy="searchbar-email-name-input"]').type(
            "phylomedb@test.test",
        );
        cy.get('[data-cy="email-name-div-filtered"]').first().click();
        cy.get('[data-cy="modify-admin-user-button"]').click();
        cy.get('[data-cy="confirm-update-button"]').click();
        cy.on("window:alert", (alertText) => {
            expect(alertText).to.eq("The data can't be the same");
        });
        cy.get('[data-cy="success-window"]').should("not.exist");
    });

    it("test to modify admin email with empty input name field", () => {
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="toggle-admin-menu-button"]').click();
        cy.get('[data-cy="select-filter-search-admin"]').select("email", {
            force: true,
        });
        cy.get('[data-cy="searchbar-email-name-input"]').type(
            "phylomedb@test.test",
        );
        cy.get('[data-cy="email-name-div-filtered"]').first().click();
        cy.get('[data-cy="modify-admin-user-button"]').click();
        cy.get('[data-cy="email-input-admin"]').clear().type("test@test.test");
        cy.get('[data-cy="confirm-update-button"]').click();
        cy.get('[data-cy="success-window"]').should("not.exist");
    });
    it("test to modify admin email ", () => {
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="toggle-admin-menu-button"]').click();
        cy.get('[data-cy="select-filter-search-admin"]').select("email", {
            force: true,
        });
        cy.get('[data-cy="searchbar-email-name-input"]').type(
            "phylomedb@test.test",
        );
        cy.get('[data-cy="email-name-div-filtered"]').first().click();
        cy.get('[data-cy="modify-admin-user-button"]').click();
        cy.get('[data-cy="email-input-admin"]')
            .clear()
            .type("phylomedbtest@test.test");
        cy.get('[data-cy="name-input-admin"]').clear().type("testnewtest");
        cy.get('[data-cy="confirm-update-button"]').click();
        cy.get('[data-cy="success-window"]').should(
            "contain",
            "Admin user phylomedb@test.test updated successfully",
        );
    });
    it("test to modify admin email , insert existing mail", () => {
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="toggle-admin-menu-button"]').click();
        cy.get('[data-cy="select-filter-search-admin"]').select("email", {
            force: true,
        });
        cy.get('[data-cy="searchbar-email-name-input"]').type(
            "phylomedbtest@test.test",
        );
        cy.get('[data-cy="email-name-div-filtered"]').first().click();
        cy.get('[data-cy="modify-admin-user-button"]').click();
        cy.get('[data-cy="email-input-admin"]').clear().type("test@test.test");
        cy.get('[data-cy="name-input-admin"]').clear().type("testnewtest");
        cy.get('[data-cy="confirm-update-button"]').click();
        cy.get('[data-cy="error-message-window"]').should(
            "contain",
            "Error: Email test@test.test already exists",
        );
    });

    it("test to delete admin email", () => {
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="toggle-admin-menu-button"]').click();
        cy.get('[data-cy="select-filter-search-admin"]').select("email", {
            force: true,
        });
        cy.get('[data-cy="searchbar-email-name-input"]').type(
            "phylomedbtest@test.test",
        );
        cy.get('[data-cy="email-name-div-filtered"]').first().click();
        cy.get('[data-cy="delete-admin-user-button"]').click();
        cy.get('[data-cy="confirm-delete-admin-user-button"]').click();
        cy.get('[data-cy="success-window"]').should(
            "contain",
            "Admin user phylomedbtest@test.test deleted successfully.",
        );
    });
});


