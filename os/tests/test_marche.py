"""Tests de la commande marche (bibliothèque standard uniquement).

Lancement : python3 -m unittest discover -s os/tests
"""

import importlib.machinery
import importlib.util
import io
import math
import os
import tempfile
import unittest
from contextlib import redirect_stdout

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
SCRIPT = os.path.join(ROOT, "os", "rootfs", "usr", "local", "bin", "marche")

loader = importlib.machinery.SourceFileLoader("marche", SCRIPT)
spec = importlib.util.spec_from_loader("marche", loader)
marche = importlib.util.module_from_spec(spec)
loader.exec_module(marche)


class Indicateurs(unittest.TestCase):
    def test_sma(self):
        self.assertEqual(marche.sma([1, 2, 3, 4, 5], 3), [None, None, 2, 3, 4])

    def test_ema_initialisee_par_sma(self):
        e = marche.ema([1, 2, 3, 4, 5], 3)
        self.assertEqual(e[:2], [None, None])
        self.assertAlmostEqual(e[2], 2.0)
        self.assertAlmostEqual(e[3], 3.0)  # 4*0.5 + 2*0.5

    def test_rsi_extremes(self):
        up = list(range(1, 40))
        self.assertEqual(marche.last(marche.rsi(up)), 100.0)
        down = list(range(40, 1, -1))
        self.assertAlmostEqual(marche.last(marche.rsi(down)), 0.0)

    def test_bollinger_constante(self):
        mid, up, lo = marche.bollinger([5.0] * 30)
        self.assertEqual((mid[-1], up[-1], lo[-1]), (5.0, 5.0, 5.0))

    def test_drawdown(self):
        self.assertAlmostEqual(marche.max_drawdown([100, 120, 60, 130]), -0.5)

    def test_correlation(self):
        a = [1, 2, 3, 4, 5]
        self.assertAlmostEqual(marche.pearson(a, [2, 4, 6, 8, 10]), 1.0)
        self.assertAlmostEqual(marche.pearson(a, [5, 4, 3, 2, 1]), -1.0)


class Backtest(unittest.TestCase):
    def test_tendance_reguliere(self):
        vals = [100 * 1.01 ** i for i in range(120)]
        eq, trades, _ = marche.backtest(vals, "sma", fees=0)
        # entré au premier jour où MM20 > MM50 (indice 49), exécuté à la clôture suivante
        self.assertAlmostEqual(eq[-1], vals[-1] / vals[49], places=6)
        self.assertEqual(len(trades), 1)

    def test_sans_anticipation(self):
        # un saut le dernier jour ne doit pas profiter d'une position prise le même jour
        vals = [100.0] * 80 + [200.0]
        eq, _, _ = marche.backtest(vals, "momentum", fees=0)
        self.assertEqual(eq[-1], 1.0)

    def test_frais(self):
        vals = [100 * 1.01 ** i for i in range(120)]
        sans, _, _ = marche.backtest(vals, "sma", fees=0)
        avec, _, _ = marche.backtest(vals, "sma", fees=0.01)
        self.assertLess(avec[-1], sans[-1])


class Commandes(unittest.TestCase):
    """Exécute les commandes sur les données du dépôt (trading/data)."""

    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.mkdtemp()
        os.environ["MARCHE_LOCAL_DATA"] = os.path.join(ROOT, "trading", "data")
        marche.CONFIG_DIR = os.path.join(cls.tmp, "config")
        marche.CACHE_DIR = os.path.join(cls.tmp, "cache")
        marche.ALERTS_FILE = os.path.join(marche.CONFIG_DIR, "alertes.json")

    def run_cmd(self, *argv):
        buf = io.StringIO()
        with redirect_stdout(buf):
            code = marche.main(list(argv))
        self.assertEqual(code, 0)
        return buf.getvalue()

    def test_cours(self):
        out = self.run_cmd("cours", "SPX", "EURUSD")
        self.assertIn("S&P 500", out)
        self.assertIn("EURUSD", out)

    def test_symbole_brvm_sans_prefixe(self):
        self.assertIn("Sonatel", self.run_cmd("cours", "SNTS"))

    def test_analyse_et_backtest(self):
        self.assertIn("RSI 14", self.run_cmd("analyse", "AAPL"))
        self.assertIn("Achat-conservation", self.run_cmd("backtest", "GOLD"))

    def test_graph_et_correlation(self):
        self.assertIn("Performance", self.run_cmd("graph", "CAC", "--largeur", "40"))
        self.assertIn("SPX", self.run_cmd("correlation", "SPX", "GOLD"))

    def test_risque(self):
        out = self.run_cmd("risque", "--capital", "10000", "--entree", "100", "--stop", "95")
        self.assertIn("20.0000", out)

    def test_alertes(self):
        self.run_cmd("alerte", "ajouter", "GOLD", ">", "1")
        self.assertIn("GOLD", self.run_cmd("alerte", "liste"))
        out = self.run_cmd("alerte", "verifier")
        self.assertIn("Alerte GOLD", out)
        self.assertEqual(marche.load_alerts(), [])  # déclenchée => retirée

    def test_rapport_et_export(self):
        d = os.path.join(self.tmp, "rapports")
        self.run_cmd("rapport", "--dossier", d)
        files = sorted(os.listdir(d))
        self.assertEqual(len(files), 2)
        with open(os.path.join(d, [f for f in files if f.endswith(".html")][0]), encoding="utf-8") as f:
            self.assertIn("<table>", f.read())
        csv_path = os.path.join(self.tmp, "eur.csv")
        self.run_cmd("export", "EURUSD", "-o", csv_path)
        with open(csv_path, encoding="utf-8") as f:
            self.assertEqual(f.readline().strip(), "date;cloture")


if __name__ == "__main__":
    unittest.main()
