import type {
  SerializedLexicalNode,
  SerializedTextNode,
  Spread,
} from 'lexical';

import type { TokenConfig } from './tokens';

/**
 * Serialized shapes for the custom nodes. Changing these changes the saved
 * document format, so treat them as a contract.
 */

export type TokenData = Pick<TokenConfig, 'name' | 'label'>;

export type SerializedTokenNode = Spread<TokenData, SerializedTextNode>;

export interface ImagePayload {
  /** The URL where the image is stored */
  src?: string;
  /** The alt text to be displayed when image can't be displayed */
  altText?: string;
  /** Stretch the image to 100% of the document width, otherwise use max-width */
  stretch?: boolean;
  /** Alignment of the image. Has no effect when stretch is true. */
  align?: 'left' | 'center' | 'right';
  /**
   * An image dragged into the editor without explicitly creating an image node
   * first. A raw File that still needs to be uploaded.
   */
  initialFile?: File | string;
  /** The width to display the image in pixels */
  width?: number;
  /** The height to display the image in pixels */
  height?: number;
}

export type SerializedImageNode = SerializedLexicalNode & ImagePayload;

export interface ButtonPayload {
  /** The url that will be placed in the HREF */
  url?: string;
  /** Display text */
  label?: string;
  /** Text color */
  color?: string;
  /** Background color */
  backgroundColor?: string;
}

export type SerializedButtonNode = Spread<ButtonPayload, SerializedLexicalNode>;

/** Non-optional variant used by the button plugin and its editing form. */
export type ButtonBlockData = {
  url: string;
  label: string;
  backgroundColor: string;
  color: string;
};

/**
 * The editor branches on this to decide which toolbar controls and nodes are
 * offered.
 */
export enum MailableFormat {
  TEMPLATE = 'Template',
  RICH_TEXT = 'RichText',
  UPLOAD_HTML = 'UploadHtml',
}
