export const metadata = {
    title: "PhylomeDB Cookie Policy",
    description: "Learn about PhylomeDB's cookie policy.",
};

export default function Page() {
    return (
        <div className="p-8 max-w-4xl mx-auto bg-white">
            <img
                alt="phylomedb icon"
                width={150}
                height={150}
                src="/logos/phylomedb-logo-lg.webp"
                className="mb-5"
            />
            <h1 className="text-2xl">PhylomeDB Cookie Policy</h1>
            <div className="flex flex-col w-full justify-center items-start gap-2 py-4">
                <h2 className="text-xl font-bold">General</h2>
                <p className="text-justify">
                    This Cookie Policy is an addendum to the Privacy Policy of
                    PhylomeDB. Any definitions used in those Policies, will have
                    the same meaning in this Policy. This Policy outlines how
                    PhylomeDB uses Cookies and other tracking technologies to
                    run and deliver the service, and how you can choose which
                    type of tracking to disable.
                </p>

                <hr className="w-48 h-1 mx-auto my-1 bg-gray-100 border-0 rounded dark:bg-gray-700" />
                <div className="flex flex-col w-full justify-center items-start gap-2 py-4">
                    <h2 className="text-xl font-bold">What is a cookie?</h2>

                    <p className="text-justify">
                        A cookie is a small text file with an identifier sent by
                        us to your computer or mobile device, and stored in your
                        browser. “Session-based” cookies last only while your
                        browser is open and are then deleted. “Persistent”
                        cookies last until you or your browser deletes them, or
                        they expire. Cookies do not typically contain any
                        personally identifiable information, but may be linked
                        to personal information we store about you. E.g. if you
                        are logged in with a registered user, the cookie will
                        help us remember that you are logged in when you return
                        to the site. To find out more about cookies, visit{" "}
                        <a
                            className="text-sky-600"
                            href="http://www.allaboutcookies.org"
                        >
                            this site
                        </a>
                        .
                    </p>

                    <h2 className="text-xl font-bold">
                        What is local storage?
                    </h2>
                    <p className="text-justify">
                        Local storage is a component of the Web storage
                        application programming interface. It is a method by
                        which Web pages can store information inside your Web
                        browser. Similar to cookies, this stored information
                        exists even when you close a browser tab, surf away from
                        the current website or close the main browser. But
                        unlike cookies this data is not carried to the remote
                        Web server unless sent explicitly by the web page. Local
                        storage is often used to remember choices a user has
                        made inside a Web application or to cache information to
                        improve performance. Elements stored in browser Local
                        storage is covered by this policy to the extent that the
                        information stored in these elements is communicated
                        back to the server.
                    </p>

                    <h2 className="text-xl font-bold">
                        Managing cookies and local storage
                    </h2>
                    <p className="text-justify">
                        Most browsers allow you to refuse to accept cookies and
                        to delete cookies. If you block cookies, you may not be
                        able to use all the features on PhylomeDB, or have a
                        worse experience.
                    </p>
                    <h2 className="text-xl font-bold">
                        How we use cookies and local storage
                    </h2>
                    <p className="text-justify">
                        PhylomeDB uses cookies and local storage on our site
                        (PhylomeDB and any subpages). Any browser visiting
                        PhylomeDB will receive cookies from us. PhylomeDB uses
                        cookies and similar technologies on our site that help
                        us collect information needed to run and deliver
                        PhylomeDB.
                    </p>

                    <h2 className="text-xl font-bold">
                        Cookies and local storage that we use
                    </h2>

                    <p>We use cookies for the following purposes:</p>

                    <table className=" border-separate border border-slate-500">
                        <thead>
                            <tr>
                                <th className="border border-slate-600 px-2 text-nowrap p-4">
                                    Categories of use
                                </th>
                                <th className="border border-slate-600">
                                    Description
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-slate-600 text-center px-2">
                                    Authentication
                                </td>
                                <td className="border border-slate-600 text-justify p-4">
                                    We use local storage to identify you when
                                    you visit PhylomeDB and to authenticate
                                    calls our web application makes to the
                                    backend servers on your behalf. If you're
                                    signed in to PhylomeDB, this helps us show
                                    you the right information and personalize
                                    your experience.
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-slate-600 text-center p-2">
                                    Analysis
                                </td>
                                <td className="border border-slate-600 text-justify p-4">
                                    We use cookies to help us analyze the usage
                                    patterns and performance of PhylomeDB and
                                    its services.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
