// Limitation des tentatives (ADR-004) : fenêtre glissante en mémoire. Suffisant pour une instance unique ;
// à remplacer par Redis quand l'API tournera sur plusieurs instances (après choix de l'hébergeur).
export class Limiteur {
  private readonly essais = new Map<string, number[]>();

  constructor(
    private readonly maximum: number,
    private readonly fenetreMs: number,
  ) {}

  /** Enregistre un essai ; renvoie false si la limite est dépassée. */
  autoriser(cle: string, maintenant = Date.now()): boolean {
    const recents = (this.essais.get(cle) ?? []).filter((t) => maintenant - t < this.fenetreMs);
    if (recents.length >= this.maximum) {
      this.essais.set(cle, recents);
      return false;
    }
    recents.push(maintenant);
    this.essais.set(cle, recents);
    return true;
  }

  vider(): void {
    this.essais.clear();
  }
}
