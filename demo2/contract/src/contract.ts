import {
  NearBindgen,
  near,
  call,
  view,
  initialize,
  LookupMap,
  UnorderedMap,
  assert,
} from "near-sdk-js";
import { AccountId } from "near-sdk-js/lib/types";

class Token {
  token_id: number;
  owner_id: AccountId;
  name: string;
  description: string;
  media_uri: string;
  level: number;
  constructor(
    token_id: number,
    owner_id: AccountId,
    name: string,
    description: string,
  ) {
    (this.token_id = token_id),
      (this.owner_id = owner_id),
      (this.name = name),
      (this.description = description)
  }
}

@NearBindgen({})
class Contract {
  owner_id: AccountId;
  token_id: number;
  owner_by_id: LookupMap<string>;
  token_by_id: LookupMap<any>;
  constructor() {
    this.token_id = 0;
    this.owner_id = "";
    this.owner_by_id = new LookupMap("o");
    this.token_by_id = new LookupMap("t");
  }

  @initialize({})
  init({ owner_id, prefix }: { owner_id: AccountId; prefix: string }) {
    this.token_id = 0;
    this.owner_id = owner_id;
    this.owner_by_id = new LookupMap(prefix);
    this.token_by_id = new LookupMap("t");
  }

  @call({}) // token_id = 0
  mint_nft({ token_owner_id, name, description }) {
    this.owner_by_id.set(this.token_id.toString(), token_owner_id); //{tokenId = 0, 'dangquangvurust.testnet'}

    let token = new Token(
      this.token_id,
      token_owner_id,
      name,
      description,
    );

    this.token_by_id.set(this.token_id.toString(), token);

    this.token_id++;

    return token;
  }

  @view({})
  get_token_by_id({ token_id }: { token_id: number }) {
    let token = this.token_by_id.get(token_id.toString());

    if (token === null) {
      return null;
    }

    return token;
  }

  @view({})
  get_supply_tokens() {
    return this.token_id;
  }

  @view({})
  get_all_tokens({ start, max }: { start?: number; max?: number }) {
    var all_tokens = [];

    for (var i = 0; i < this.token_id; i++) {
      all_tokens.push(this.token_by_id.get(i.toString()));
    }

    return all_tokens;
  }

  @call({})
  tranfer_Owner_TokenNft({ new_owner,current_owner,token_id }: {new_owner:AccountId,current_owner:AccountId, token_id: number }){
    let token = this.token_by_id.get(token_id.toString());
    const account_id = near.currentAccountId();
    assert(account_id !== null, "Token not found");
    assert(current_owner === token.owner_id, "Sender must be the current owner");
    assert(account_id !== new_owner, "Current and next owner must differ");

    this.owner_by_id.set(this.token_id.toString(), new_owner); 
    token.owner_id = new_owner;
    this.token_by_id.set(token_id.toString(),token);
    return token;
  }
}