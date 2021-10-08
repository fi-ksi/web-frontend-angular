import { User } from "../../api";

export class Utils {
  /**
   * Creates a substring of a HTML by putting it into a div element and then substringing .innerText
   * @param html html to substring
   * @param start where to start
   * @param length how many characters to keep
   * @private
   */
  public static substrHTML(html: string, start: number, length?: number): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.innerText.substr(start, length);
  }

  /**
   * Resolves legacy address into new assets format
   * @param url possilby legacy url
   * @private
   */
  public static parseLegacyAssetsUrl(url: string): string {
    return url.startsWith('img/') ? `assets/${url}` : url;
  }

  public static getOrgProfilePicture(organisator: User): string {
    if (organisator.profile_picture) {
      return organisator.profile_picture;
    }
    if (organisator.gender === 'male') {
      return 'assets/img/avatar/org.svg';
    }
    return 'assets/img/avatar/org-woman.svg';
  }
}
