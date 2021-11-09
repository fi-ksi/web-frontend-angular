import { User, Task } from "../../api";
import { environment } from "../../environments/environment";

type RecursiveArray<T> = Array<T | RecursiveArray<T>>;

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
      return Utils.fixUrl(`${environment.backend}${organisator.profile_picture}`);
    }
    if (organisator.gender === 'male') {
      return 'assets/img/avatar/org.svg';
    }
    return 'assets/img/avatar/org-woman.svg';
  }

  /**
   * Finds an element inside a multidimensional array
   * @param array multidimensional array to search into
   * @param element element to locate
   * @return true if the element is contained inside the multidimensional array
   */
  public static deepContains<T>(array: RecursiveArray<T>, element: T): boolean {
    for (let x of array) {
      if ((Array.isArray(x) && Utils.deepContains(x, element)) || (element === x)) {
        return true;
      }
    }
    return false;
  }

  public static getTaskIconURL(task: Task): string {
    return Utils.fixUrl(`${environment.backend}${task.picture_base}/${task.state}${task.picture_suffix}`);
  }

  public static fixUrl(url: string): string {
    const replace = (x: string): string => x.replace(/([^:])\/\//g, '$1/');
    return replace(replace(url));
  }
}
