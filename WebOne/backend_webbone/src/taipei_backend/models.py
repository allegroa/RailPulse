from dataclasses import dataclass

@dataclass
class Station:
    id:str
    name_en:str
    name_zh:str
    x:float
    y:float
    lines:list[str]
    transfer:bool

@dataclass
class MetroLine:
    id:str
    name:str
    color:str
    stations:list[str]
