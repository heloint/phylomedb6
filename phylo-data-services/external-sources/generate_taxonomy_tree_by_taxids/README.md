# generate_taxonomy_tree_by_taxids

Generates images of taxonomy trees based on the given list of taxonomy identifiers via the NCBI database.

---

# Table of content

[Pre-requirements](#pre-requirements)

[Install / Uninstall](#install-uninstall)
 - [Normal installation](#normal-installation)
 - [Editable installation](#editable-installation)
 - [Uninstall](#uninstall)

[Execution](#execution)
 - [Command example](#command-example)
 - [Result images](#result-images)

[Citations / Acknowledgments](#citations-acknowledgments)

---

## 1. Pre-requirements <a id="pre-requirements" />
This tool is heavily based on QT dependencies, so make sure you have installed the followings:

**If you are on Debian based systems**
```bash
    sudo apt-get update && \
    sudo apt-get install -y \
        xvfb \
        libxcb-* \
        libxkbcommon-x11-dev \
        libdbus-1-dev \
        libqt5pdf5
```

**Also, it is recommended to set the following environment variable to avoid undesired error messages.**
```bash
export QT_DEBUG_PLUGINS=1
```

---

## 2. Install / Uninstall <a id="install-uninstall" />

### 2.1. Normal installation <a id="normal-installation" />
```bash
make install
```

### 2.2. Editable installation <a id="editable-installation" />
```bash
make install-editable
```

### 2.3. Uninstall <a id="uninstall" />
```bash
make uninstall
```

---

## 3. Execution <a id="execution" />

### 3.1 Command example <a id="command-example" />

```bash
xvfb-run python3 -m generate_taxonomy_tree_by_taxids \
    --output_directory_path ./test-out \
    --image_names_prefix example_taxa_tree \
    --add_titles \
    --taxonomy_ids 9606 \
                    10090 \
                    3702 \
                    7227 \
                    10116 \
                    7955 \
                    559292 \
                    4896 \
                    6239 \
                    4932 \
                    13616 \
                    9913 \
                    7460 \
                    7897 \
                    9813 \
                    9823 \
                    9796 \
                    9615 \
                    515635 \
                    9986 \
                    8364 \
                    9598 \
                    7954 \
                    8355 \
                    99883 \
                    31033 \
                    9601 \
                    9989 \
                    7070 \
                    10029 \
                    10031 \
                    88036 \
                    13635 \
                    9031 \
                    39107 \
                    746128 \
                    6939 \
                    322 \
                    8365 \
                    9361
```


### 3.2 Result images <a id="result-images" />

**Circular image**

![circular image exmaple](https://raw.githubusercontent.com/heloint/generate_taxonomy_tree_by_taxids/refs/heads/main/assets/example_taxa_tree_circular.png)

**Rectangular image**

![rectangular image exmaple](https://raw.githubusercontent.com/heloint/generate_taxonomy_tree_by_taxids/refs/heads/main/assets/example_taxa_tree_rectangular.png)

---

## 4. Citations / Acknowledgments <a id="citations-acknowledgments" />

### 4.1 ETE3 <a id="ete3" />

[ETETOOLKIT - ETE3](https://github.com/etetoolkit/ete/)
Jaime Huerta-Cepas, François Serra and Peer Bork. "ETE 3: Reconstruction,
analysis and visualization of phylogenomic data."  Mol Biol Evol (2016) doi:
10.1093/molbev/msw046

---
