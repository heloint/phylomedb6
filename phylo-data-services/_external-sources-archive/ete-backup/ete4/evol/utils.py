from math import log, exp
from numpy import floor, pi as PI, sin

from .. import Tree


def get_rooting(tol, seed_species, agename=False):
    """
    returns dict of species age for a given TOL and a given seed

    **Example:**

    ::

      tol  = "((((((((Drosophila melanogaster,(Drosophila simulans,Drosophila secchellia)),(Drosophila yakuba,Drosophila erecta))[&&NHX:name=melanogaster subgroup],Drosophila ananassae)[&&NHX:name=melanogaster group],(Drosophila pseudoobscura,Drosophila persimilis)[&&NHX:name=obscura group])[&&NHX:name=Sophophora Old World],Drosophila willistoni)[&&NHX:name=subgenus Sophophora],(Drosophila grimshawi,(Drosophila virilis,Drosophila mojavensis))[&&NHX:name=subgenus Drosophila])[&&NHX:name=genus Drosophila],(Anopheles gambiae,Aedes aegypti)[&&NHX:name=Culicidae])[&&NHX:name=Arthropoda],Caenorhabditis elegans)[&&NHX:name=Animalia];"
      seed = "Drosophila melanogaster"
      ROOTING, age2name = get_rooting (tol, seed, True)

      ROOTING == {"Aedes aegypti"           : 7,
                  "Anopheles gambiae"       : 7,
                  "Caenorhabditis elegans"  : 8,
                  "Drosophila ananassae"    : 3,
                  "Drosophila erecta"       : 2,
                  "Drosophila grimshawi"    : 6,
                  "Drosophila melanogaster" : 1,
                  "Drosophila mojavensis"   : 6,
                  "Drosophila persimilis"   : 4,
                  "Drosophila pseudoobscura": 4,
                  "Drosophila secchellia"   : 1,
                  "Drosophila simulans"     : 1,
                  "Drosophila virilis"      : 6,
                  "Drosophila willistoni"   : 5,
                  "Drosophila yakuba"       : 2}

      age2name == {1: "Drosophila melanogaster. Drosophila simulans. Drosophila secchellia",
                   2: "melanogaster subgroup",
                   3: "melanogaster group",
                   4: "Sophophora Old World",
                   5: "subgenus Sophophora",
                   6: "genus Drosophila",
                   7: "Arthropoda",
                   8: "Animalia"}

    :argument seed_species: species name
    :argument False agename: if True, also returns the inverse dictionary

    :returns: ROOTING dictionary with age of each species

    """

    tol = Tree(tol)
    try:
        node = tol.search_nodes(name=seed_species)[0]
    except IndexError:
        exit("ERROR: Seed species not found in tree\n")
    age = 1
    ROOTING = {}
    if agename:
        age2name = {}
    while not node.is_root:
        node = node.up
        for leaf in node.get_leaf_names():
            if agename:
                if node.name == "NoName":
                    nam = ".".join(node.get_leaf_names())
                else:
                    nam = node.name
                age2name.setdefault(age, nam)
            ROOTING.setdefault(leaf, age)
        age += 1
    if agename:
        return ROOTING, age2name
    return ROOTING


def translate(sequence):
    """
    little function to translate DNA to protein...
    from: http://python.genedrift.org/
    TODO : inseqgroup functions?

    :argument sequence: string

    :returns: translated sequence
    """
    # dictionary with the genetic code
    gencode = {
        "ATA": "I",
        "ATC": "I",
        "ATT": "I",
        "ATG": "M",
        "ACA": "T",
        "ACC": "T",
        "ACG": "T",
        "ACT": "T",
        "AAC": "N",
        "AAT": "N",
        "AAA": "K",
        "AAG": "K",
        "AGC": "S",
        "AGT": "S",
        "AGA": "R",
        "AGG": "R",
        "CTA": "L",
        "CTC": "L",
        "CTG": "L",
        "CTT": "L",
        "CCA": "P",
        "CCC": "P",
        "CCG": "P",
        "CCT": "P",
        "CAC": "H",
        "CAT": "H",
        "CAA": "Q",
        "CAG": "Q",
        "CGA": "R",
        "CGC": "R",
        "CGG": "R",
        "CGT": "R",
        "GTA": "V",
        "GTC": "V",
        "GTG": "V",
        "GTT": "V",
        "GCA": "A",
        "GCC": "A",
        "GCG": "A",
        "GCT": "A",
        "GAC": "D",
        "GAT": "D",
        "GAA": "E",
        "GAG": "E",
        "GGA": "G",
        "GGC": "G",
        "GGG": "G",
        "GGT": "G",
        "TCA": "S",
        "TCC": "S",
        "TCG": "S",
        "TCT": "S",
        "TTC": "F",
        "TTT": "F",
        "TTA": "L",
        "TTG": "L",
        "TAC": "Y",
        "TAT": "Y",
        "TAA": ".",
        "TAG": ".",
        "TGC": "C",
        "TGT": "C",
        "TGA": ".",
        "TGG": "W",
        "---": "-",
        "nnn": "x",
        "NNN": "X",
    }
    ambig = {
        "Y": ["A", "G"],
        "R": ["C", "T"],
        "M": ["G", "T"],
        "K": ["A", "C"],
        "S": ["G", "C"],
        "W": ["A", "T"],
        "V": ["C", "G", "T"],
        "H": ["A", "G", "T"],
        "D": ["A", "C", "T"],
        "B": ["A", "C", "G"],
        "N": ["A", "C", "G", "T"],
    }
    proteinseq = ""
    # loop to read DNA sequence in codons, 3 nucleotides at a time
    sequence = sequence.upper()
    for n in range(0, len(sequence), 3):
        # checking to see if the dictionary has the key
        try:
            proteinseq += gencode[sequence[n : n + 3]]
        except KeyError:
            newcod = []
            for nt in sequence[n : n + 3]:
                if nt in ambig:
                    newcod.append(ambig[nt])
                else:
                    newcod.append(list(nt))
            aa = ""
            for nt1 in newcod[0]:
                for nt2 in newcod[1]:
                    for nt3 in newcod[2]:
                        try:
                            if aa == "":
                                aa = gencode[nt1 + nt2 + nt3]
                            elif gencode[nt1 + nt2 + nt3] != aa:
                                aa = "X"
                                break
                        except KeyError:
                            aa = "X"
                            break
            proteinseq += aa
    return proteinseq


# reused from pycogent
ROUND_ERROR = 1e-14
MAXLOG = 7.09782712893383996843e2
MAXLGM = 2.556348e305
big = 4.503599627370496e15
biginv = 2.22044604925031308085e-16
MACHEP = 1.11022302462515654042e-16
LS2PI = 0.91893853320467274178
LOGPI = 1.14472988584940017414


def chi_high(x, df):
    """Returns right-hand tail of chi-square distribution (x to infinity).

    df, the degrees of freedom, ranges from 1 to infinity (assume integers).
    Typically, df is (r-1)*(c-1) for a r by c table.

    Result ranges from 0 to 1.

    See Cephes docs for details.
    """
    x = fix_rounding_error(x)

    if x < 0:
        raise ValueError("chi_high: x must be >= 0 (got %s)." % x)
    if df < 1:
        raise ValueError("chi_high: df must be >= 1 (got %s)." % df)
    return igamc(float(df) / 2, x / 2)


def fix_rounding_error(x):
    """If x is almost in the range 0-1, fixes it.

    Specifically, if x is between -ROUND_ERROR and 0, returns 0.
    If x is between 1 and 1+ROUND_ERROR, returns 1.
    """
    if -ROUND_ERROR < x < 0:
        return 0
    elif 1 < x < 1 + ROUND_ERROR:
        return 1
    return x


def igamc(a, x):
    """Complemented incomplete Gamma integral: see Cephes docs."""
    if x <= 0 or a <= 0:
        return 1
    if x < 1 or x < a:
        return 1 - igam(a, x)
    ax = a * log(x) - x - lgam(a)
    if ax < -MAXLOG:  # underflow
        return 0
    ax = exp(ax)
    # continued fraction
    y = 1 - a
    z = x + y + 1
    c = 0
    pkm2 = 1
    qkm2 = x
    pkm1 = x + 1
    qkm1 = z * x
    ans = pkm1 / qkm1

    while 1:
        c += 1
        y += 1
        z += 2
        yc = y * c
        pk = pkm1 * z - pkm2 * yc
        qk = qkm1 * z - qkm2 * yc
        if qk != 0:
            r = pk / qk
            t = abs((ans - r) / r)
            ans = r
        else:
            t = 1
        pkm2 = pkm1
        pkm1 = pk
        qkm2 = qkm1
        qkm1 = qk
        if abs(pk) > big:
            pkm2 *= biginv
            pkm1 *= biginv
            qkm2 *= biginv
            qkm1 *= biginv
        if t <= MACHEP:
            break
    return ans * ax


def lgam(x):
    """Natural log of the gamma fuction: see Cephes docs for details"""
    if x < -34:
        q = -x
        w = lgam(q)
        p = floor(q)
        if p == q:
            raise OverflowError("lgam returned infinity.")
        z = q - p
        if z > 0.5:
            p += 1
            z = p - q
        z = q * sin(PI * z)
        if z == 0:
            raise OverflowError("lgam returned infinity.")
        z = LOGPI - log(z) - w
        return z
    if x < 13:
        z = 1
        p = 0
        u = x
        while u >= 3:
            p -= 1
            u = x + p
            z *= u
        while u < 2:
            if u == 0:
                raise OverflowError("lgam returned infinity.")
            z /= u
            p += 1
            u = x + p
        if z < 0:
            z = -z
        if u == 2:
            return log(z)
        p -= 2
        x = x + p
        p = x * polevl(x, GB) / polevl(x, GC)
        return log(z) + p
    if x > MAXLGM:
        raise OverflowError("Too large a value of x in lgam.")
    q = (x - 0.5) * log(x) - x + LS2PI
    if x > 1.0e8:
        return q
    p = 1 / (x * x)
    if x >= 1000:
        q += (
            (7.9365079365079365079365e-4 * p - 2.7777777777777777777778e-3) * p
            + 0.0833333333333333333333
        ) / x
    else:
        q += polevl(p, GA) / x
    return q


def polevl(x, coef):
    """evaluates a polynomial y = C_0 + C_1x + C_2x^2 + ... + C_Nx^N

    Coefficients are stored in reverse order, i.e. coef[0] = C_N
    """
    result = 0
    for c in coef:
        result = result * x + c
    return result


def igam(a, x):
    """Left tail of incomplete gamma function: see Cephes docs for details"""
    if x <= 0 or a <= 0:
        return 0
    if x > 1 and x > a:
        return 1 - igamc(a, x)

    # Compute x**a * exp(x) / Gamma(a)

    ax = a * log(x) - x - lgam(a)
    if ax < -MAXLOG:  # underflow
        return 0.0
    ax = exp(ax)

    # power series
    r = a
    c = 1
    ans = 1
    while 1:
        r += 1
        c *= x / r
        ans += c
        if c / ans <= MACHEP:
            break

    return ans * ax / a


# Coefficients for Gamma follow:
GA = [
    8.11614167470508450300e-4,
    -5.95061904284301438324e-4,
    7.93650340457716943945e-4,
    -2.77777777730099687205e-3,
    8.33333333333331927722e-2,
]

GB = [
    -1.37825152569120859100e3,
    -3.88016315134637840924e4,
    -3.31612992738871184744e5,
    -1.16237097492762307383e6,
    -1.72173700820839662146e6,
    -8.53555664245765465627e5,
]

GC = [
    1.00000000000000000000e0,
    -3.51815701436523470549e2,
    -1.70642106651881159223e4,
    -2.20528590553854454839e5,
    -1.13933444367982507207e6,
    -2.53252307177582951285e6,
    -2.01889141433532773231e6,
]

GP = [
    1.60119522476751861407e-4,
    1.19135147006586384913e-3,
    1.04213797561761569935e-2,
    4.76367800457137231464e-2,
    2.07448227648435975150e-1,
    4.94214826801497100753e-1,
    9.99999999999999996796e-1,
]

GQ = [
    -2.31581873324120129819e-5,
    5.39605580493303397842e-4,
    -4.45641913851797240494e-3,
    1.18139785222060435552e-2,
    3.58236398605498653373e-2,
    -2.34591795718243348568e-1,
    7.14304917030273074085e-2,
    1.00000000000000000320e0,
]
