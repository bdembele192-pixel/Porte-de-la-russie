#!/usr/bin/env python3
"""Ajoute les lanceurs Mèche OS au dock (panel-2) de la configuration XFCE par défaut.

Usage : panel.py ENTREE.xml SORTIE.xml
Les lanceurs du panneau, contrairement aux icônes du bureau, n'ont pas besoin
d'être marqués « de confiance » : ils fonctionnent dès la première session.
"""
import sys
import xml.etree.ElementTree as ET

LAUNCHERS = ["meche-tableau.desktop", "meche-rapport.desktop",
             "meche-jupyter.desktop", "meche-app.desktop", "meche-aide.desktop"]

src, dst = sys.argv[1], sys.argv[2]
tree = ET.parse(src)
plugins = tree.getroot().find("property[@name='plugins']")
panel2 = tree.getroot().find("property[@name='panels']/property[@name='panel-2']")
ids = panel2.find("property[@name='plugin-ids']")

used = {int(p.get("name").split("-")[1]) for p in plugins}
next_id = max(used) + 1
new_ids = []
for item in LAUNCHERS:
    p = ET.SubElement(plugins, "property", name="plugin-%d" % next_id, type="string", value="launcher")
    items = ET.SubElement(p, "property", name="items", type="array")
    ET.SubElement(items, "value", type="string", value=item)
    new_ids.append(next_id)
    next_id += 1
sep = ET.SubElement(plugins, "property", name="plugin-%d" % next_id, type="string", value="separator")
new_ids.append(next_id)

# Après « afficher le bureau » et son séparateur (deux premiers éléments du dock).
values = list(ids)
pos = 2 if len(values) >= 2 else len(values)
for offset, pid in enumerate(new_ids):
    ids.insert(pos + offset, ET.Element("value", type="int", value=str(pid)))

ET.indent(tree)
tree.write(dst, encoding="UTF-8", xml_declaration=True)
print("dock : %d lanceurs Mèche ajoutés" % len(LAUNCHERS))
